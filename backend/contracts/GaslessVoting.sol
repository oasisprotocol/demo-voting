// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {EthereumUtils} from "./sollibs/EthereumUtils.sol";
import {Sapphire} from "./sollibs/Sapphire.sol";
import {EIP155Signer} from "./sollibs/EIP155Signer.sol";
import {ProposalId, AcceptsProxyVotes} from "./Types.sol";

struct VotingRequest {
    address voter;
    bytes32 proposalId;
    uint256 choiceId;
}

contract GaslessVoting {
    bytes32 private signerSecret;

    address public signerAddr;

    bytes32 immutable private encryptionSecret;

    AcceptsProxyVotes immutable public DAO;

    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    string public constant VOTINGREQUEST_TYPE = "VotingRequest(address voter, bytes32 proposalId, uint256 choiceId)";

    bytes32 public constant VOTINGREQUEST_TYPEHASH = keccak256(bytes(VOTINGREQUEST_TYPE));

    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor (AcceptsProxyVotes in_dao)
        payable
    {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("DAOv1.GaslessVoting"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));

        DAO = in_dao;

        encryptionSecret = bytes32(Sapphire.randomBytes(32, ""));

        (signerAddr, signerSecret) = EthereumUtils.generateKeypair();

        payable(signerAddr).transfer(msg.value);
    }

    function makeTransaction(
        uint64 nonce,
        uint256 gasPrice,
        VotingRequest calldata request,
        EIP155Signer.SignatureRSV calldata rsv
    )
        external view
        returns (bytes memory)
    {
        // Validate EIP-712 signed voting request
        bytes32 requestDigest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                VOTINGREQUEST_TYPEHASH,
                request.voter,
                request.proposalId,
                request.choiceId
            ))
        ));
        require( request.voter == ecrecover(requestDigest, rsv.v, rsv.r, rsv.s), "Invalid Request!" );

        // Encrypt request to authenticate it when we're invoked again
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret, requestDigest));
        bytes memory ciphertext = Sapphire.encrypt(encryptionSecret, ciphertextNonce, abi.encode(request), "");

        // Return signed transaction invoking 'submitEncryptedVote'
        return EIP155Signer.sign(signerAddr, signerSecret, EIP155Signer.EthTx(
            nonce,
            gasPrice,
            250000,
            address(this),
            0,
            abi.encodeWithSelector(this.submitEncryptedVote.selector, ciphertextNonce, ciphertext),
            block.chainid
        ));
    }

    function submitEncryptedVote(bytes32 ciphertextNonce, bytes memory data)
        external
    {
        require( msg.sender == signerAddr );

        bytes memory plaintext = Sapphire.decrypt(encryptionSecret, ciphertextNonce, data, "");

        VotingRequest memory request = abi.decode(plaintext, (VotingRequest));

        DAO.proxyVote(request.voter, ProposalId.wrap(request.proposalId), request.choiceId);
    }
}
