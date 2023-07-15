// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {Sapphire} from '@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol';
import {EthereumUtils} from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';

import {EIP155Signer} from "./EIP155Signer.sol";
import {IERC165} from "./IERC165.sol";
import {PollACLv1, ProposalId, AcceptsProxyVotes, ProposalParams} from "./Types.sol";

struct VotingRequest {
    address voter;
    bytes32 proposalId;
    uint256 choiceId;
}

contract GaslessVoting is IERC165 {
    address private immutable OWNER;

    bytes32 private signerSecret;

    address public signerAddr;

    bytes32 immutable private encryptionSecret;

    AcceptsProxyVotes public DAO;

    // EIP-712 parameters
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    string public constant VOTINGREQUEST_TYPE = "VotingRequest(address voter,bytes32 proposalId,uint256 choiceId)";
    bytes32 public constant VOTINGREQUEST_TYPEHASH = keccak256(bytes(VOTINGREQUEST_TYPE));
    string public constant CREATEPROPOSAL_TYPE = "CreateProposal(address creator,string ipfsHash,uint16 numChoices,bool publishVotes)";
    bytes32 public constant CREATEPROPOSAL_TYPEHASH = keccak256(bytes(CREATEPROPOSAL_TYPE));
    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor (address in_owner)
        payable
    {
        OWNER = (in_owner == address(0)) ? msg.sender : in_owner;

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("DAOv1.GaslessVoting"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));

        // Generate an encryption key, it is only used by this contract to encrypt data for itself
        encryptionSecret = bytes32(Sapphire.randomBytes(32, ""));

        // Generate a keypair which will be used to submit transactions to invoke this contract
        (signerAddr, signerSecret) = EIP155Signer.generateKeypair();

        // Forward on any gas money sent while deploying
        if( msg.value > 0 ) {
            payable(signerAddr).transfer(msg.value);
        }
    }

    function supportsInterface(bytes4 interfaceID)
        external pure
        returns (bool)
    {
        return interfaceID == 0x01ffc9a7 // ERC-165
            || interfaceID == this.makeVoteTransaction.selector;
    }

    function setDAO(AcceptsProxyVotes in_dao)
        external
    {
        require( msg.sender == OWNER );

        // Can only be set once
        require( address(DAO) == address(0) );

        DAO = in_dao;
    }

    function getChainId()
        external view
        returns (uint256)
    {
        return block.chainid;
    }

    /**
     * Validate a users voting request, then give them a signed transaction to commit the vote
     *
     * The signed transaction invokes `submitEncryptedVote`, which is unmodifiable by the user
     * and hides all info about what their address is, which ballot they were voting on and
     * what their vote was.
     *
     * @param nonce Account nonce of `signerAddr`
     * @param gasPrice Which gas price to use when submitting transaction
     * @param request Voting Request
     * @param rsv EIP-712 signature for request
     * @return Signed transaction to submit via eth_sendRawTransaction
     */
    function makeVoteTransaction(
        uint64 nonce,
        uint256 gasPrice,
        VotingRequest calldata request,
        EIP155Signer.SignatureRSV calldata rsv
    )
        external view
        returns (bytes memory)
    {
        // User must be able to vote on the poll
        // so we don't waste gas submitting invalid transactions
        require( DAO.getACL().canVoteOnPoll(address(DAO), ProposalId.wrap(request.proposalId), request.voter) );

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

        // TODO: simulate query to get gas limit? then increase by 20%

        // Return signed transaction invoking 'submitEncryptedVote'
        return EIP155Signer.sign(signerAddr, signerSecret, EIP155Signer.EthTx({
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: 250000,
            to: address(this),
            value: 0,
            data: abi.encodeWithSelector(this.submitEncryptedVote.selector, ciphertextNonce, ciphertext),
            chainId: block.chainid
        }));
    }

    function submitEncryptedVote(bytes32 ciphertextNonce, bytes memory data)
        external
    {
        require( msg.sender == signerAddr, "Cannot Invoke Directly!" );

        bytes memory plaintext = Sapphire.decrypt(encryptionSecret, ciphertextNonce, data, "");

        VotingRequest memory request = abi.decode(plaintext, (VotingRequest));

        DAO.proxyVote(request.voter, ProposalId.wrap(request.proposalId), request.choiceId);
    }

    function makeProposalTransaction(
        uint64 nonce,
        uint256 gasPrice,
        address creator,
        ProposalParams calldata request,
        EIP155Signer.SignatureRSV calldata rsv
    )
        external view
        returns (bytes memory)
    {
        require( DAO.getACL().canCreatePoll(address(DAO), creator), "ACL disallows poll creation" );

        bytes32 requestDigest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                CREATEPROPOSAL_TYPEHASH,
                creator,
                keccak256(abi.encodePacked(request.ipfsHash)),
                request.numChoices,
                request.publishVotes
            ))
        ));
        require( creator == ecrecover(requestDigest, rsv.v, rsv.r, rsv.s), "Invalid Request!" );

        // Encrypt request to authenticate it when we're invoked again
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret, requestDigest));
        bytes memory ciphertext = Sapphire.encrypt(encryptionSecret, ciphertextNonce, abi.encode(request), "");

        // TODO: simulate query to get gas limit? then increase by 20%

        // Return signed transaction invoking 'submitEncryptedVote'
        return EIP155Signer.sign(signerAddr, signerSecret, EIP155Signer.EthTx({
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: 1000000,
            to: address(this),
            value: 0,
            data: abi.encodeWithSelector(this.submitEncryptedCreate.selector, ciphertextNonce, ciphertext),
            chainId: block.chainid
        }));
    }

    function submitEncryptedCreate(bytes32 ciphertextNonce, bytes memory data)
        external
    {
        require( msg.sender == signerAddr, "Cannot Invoke Directly!" );

        bytes memory plaintext = Sapphire.decrypt(encryptionSecret, ciphertextNonce, data, "");

        ProposalParams memory request = abi.decode(plaintext, (ProposalParams));

        DAO.createProposal(request);
    }

    /**
     * Allow the owner to withdraw excess funds from the Signing Account
     *
     * TODO: use signed queries?
     *
     * @param nonce transaction nonce
     * @param gasPrice gas price to use when submitting transaction
     * @param amount amount to withdraw
     * @param rsv signature R, S & V values
     * @return transaction signed by Signing Account
     */
    function withdraw(uint64 nonce, uint256 gasPrice, uint256 amount, EIP155Signer.SignatureRSV calldata rsv)
        external view
        returns (bytes memory transaction)
    {
        bytes32 inner_digest = keccak256(abi.encode(address(this), nonce, gasPrice, amount));

        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", inner_digest));

        require( OWNER == ecrecover(digest, rsv.v, rsv.r, rsv.s), "Not owner account!" );

        return EIP155Signer.sign(signerAddr, signerSecret, EIP155Signer.EthTx({
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: 250000,
            to: OWNER,
            value: amount,
            data: "",
            chainId: block.chainid
        }));
    }
}