// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { Sapphire } from '@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol';
import { EIP155Signer } from '@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol';
import { SignatureRSV, EthereumUtils } from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';
import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";

import { IPollACL } from "../interfaces/IPollACL.sol";
import { IPollManager } from "../interfaces/IPollManager.sol";
import { VotingRequest, IGaslessVoter } from "../interfaces/IGaslessVoter.sol";

/// Poll creators can subsidize voting on proposals
contract GaslessVoting is IERC165, IGaslessVoter
{
    struct EthereumKeypair {
        bytes32 gvid;
        address addr;
        bytes32 secret;
        uint64 nonce;
    }

    struct PollSettings {
        /// DAO which manages the poll
        IPollManager dao;

        /// Creator of the poll
        address owner;

        /// After closing votes can no-longer be submitted
        /// The poll creator can now withdraw funds from the subsidy accounts
        bool closed;

        /// Keypairs used to subsidise votes
        EthereumKeypair[] keypairs;
    }

    struct KeypairIndex {
        bytes32 gvid;
        uint n;
    }

    // ------------------------------------------------------------------------

    mapping(bytes32 => PollSettings) private s_polls;

    /// Lookup a poll and keypair from the address
    mapping(address => KeypairIndex) private s_addrToKeypair;

    bytes32 immutable private encryptionSecret;

    // ------------------------------------------------------------------------

    // EIP-712 parameters
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    string public constant VOTINGREQUEST_TYPE = "VotingRequest(address voter,address dao,bytes32 proposalId,uint256 choiceId)";
    bytes32 public constant VOTINGREQUEST_TYPEHASH = keccak256(bytes(VOTINGREQUEST_TYPE));
    bytes32 public immutable DOMAIN_SEPARATOR;

    // ------------------------------------------------------------------------

    constructor ()
    {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("GaslessVoting"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));

        // Generate an encryption key, it is only used by this contract to encrypt data for itself
        encryptionSecret = bytes32(Sapphire.randomBytes(32, ""));
    }

    function supportsInterface(bytes4 interfaceId)
        external pure
        returns (bool)
    {
        return interfaceId == type(IERC165).interfaceId
            || interfaceId == type(IGaslessVoter).interfaceId;
    }

    function internal_gvid(address in_dao, bytes32 in_proposalId)
        internal pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(in_dao, in_proposalId));
    }

    // ------------------------------------------------------------------------

    function listAddresses(address in_dao, bytes32 in_proposalId)
        external view
        returns (address[] memory out_addrs)
    {
        bytes32 gvid = internal_gvid(in_dao, in_proposalId);

        PollSettings storage poll = s_polls[gvid];

        EthereumKeypair[] storage keypairs = poll.keypairs;

        uint n = keypairs.length;

        if( n > 0 ) {
            out_addrs = new address[](n);
            for( uint i = 0; i < n; i++ ) {
                out_addrs[i] = keypairs[i].addr;
            }
        }
    }

    // ------------------------------------------------------------------------

    error onPollCreated_409();

    function onPollCreated(bytes32 in_proposalId, address in_creator)
        external payable
    {
        require( IERC165(msg.sender).supportsInterface(type(IPollManager).interfaceId), "ERC165" );

        bytes32 gvid = internal_gvid(msg.sender, in_proposalId);

        PollSettings storage poll = s_polls[gvid];

        if( poll.dao != IPollManager(address(0)) ) {
            revert onPollCreated_409(); // Poll already exists
        }

        poll.owner = in_creator;
        poll.dao = IPollManager(msg.sender);

        if( msg.value > 0 ) {
            internal_addKeypair(gvid);
        }
    }

    // ------------------------------------------------------------------------

    error onPollClosed_404();

    function onPollClosed(bytes32 in_proposalId)
        external
    {
        bytes32 gvid = internal_gvid(msg.sender, in_proposalId);

        PollSettings storage poll = s_polls[gvid];

        // Poll must exist
        if( poll.dao == IPollManager(address(0)) ) {
            revert onPollClosed_404();
        }

        poll.closed = true;
    }

    // ------------------------------------------------------------------------

    /**
     * Add a random keypair to the list
     */
    function internal_addKeypair(bytes32 in_gvid)
        internal
        returns (address)
    {
        (address signerAddr, bytes32 signerSecret) = EthereumUtils.generateKeypair();

        EthereumKeypair[] storage keypairs = s_polls[in_gvid].keypairs;

        keypairs.push(EthereumKeypair({
            gvid: in_gvid,
            addr: signerAddr,
            secret: signerSecret,
            nonce: 0
        }));

        s_addrToKeypair[signerAddr] = KeypairIndex(in_gvid, keypairs.length - 1);

        return signerAddr;
    }

    // ------------------------------------------------------------------------

    error internal_randomKeypair_404();

    /**
     * Select a random keypair
     */
    function internal_randomKeypair(bytes32 in_gvid)
        internal view
        returns (EthereumKeypair storage)
    {
        EthereumKeypair[] storage keypairs = s_polls[in_gvid].keypairs;
        if( keypairs.length == 0 ) {
            revert internal_randomKeypair_404();
        }

        uint16 x = uint16(bytes2(Sapphire.randomBytes(2, "")));

        uint n = keypairs.length;

        require( n > 0 );

        return keypairs[x % keypairs.length];
    }

    // ------------------------------------------------------------------------

    error internal_keypairByAddress_404();

    /**
     * Select a keypair given its address
     * Reverts if it's not one of our keypairs
     * @param addr Ethererum public address
     */
    function internal_keypairByAddress(address addr)
        internal view
        returns (
            PollSettings storage out_poll,
            EthereumKeypair storage out_keypair
        )
    {
        KeypairIndex memory idx = s_addrToKeypair[addr];

        // Keypair must exist for address
        if( idx.gvid == 0 ) {
            revert internal_keypairByAddress_404();
        }

        out_poll = s_polls[idx.gvid];

        out_keypair = out_poll.keypairs[idx.n];
    }

    // ------------------------------------------------------------------------

    error addKeypair_403();

    /**
     * Create a random keypair, sending some gas to it
     */
    function addKeypair (address in_dao, bytes32 in_proposalId)
        external payable
    {
        bytes32 gvid = internal_gvid(in_dao, in_proposalId);

        // poll must be owned by sender
        if( s_polls[gvid].owner != msg.sender ) {
            revert addKeypair_403();
        }

        address addr = internal_addKeypair(gvid);

        if( msg.value > 0 ) {
            payable(addr).transfer(msg.value);
        }
    }

    // ------------------------------------------------------------------------

    error makeVoteTransaction_404();
    error makeVoteTransaction_401();
    error makeVoteTransaction_403();

    /**
     * Validate a users voting request, then give them a signed transaction to commit the vote
     *
     * The signed transaction invokes `submitEncryptedVote`, which is unmodifiable by the user
     * and hides all info about what their address is, which ballot they were voting on and
     * what their vote was.
     *
     * @param in_gasPrice Which gas price to use when submitting transaction
     * @param in_request Voting Request
     * @param in_rsv EIP-712 signature for request
     * @return output Signed transaction to submit via eth_sendRawTransaction
     */
    function makeVoteTransaction(
        uint256 in_gasPrice,
        VotingRequest calldata in_request,
        bytes calldata in_data,
        SignatureRSV calldata in_rsv
    )
        external view
        returns (bytes memory output)
    {
        bytes32 gvid = internal_gvid(in_request.dao, in_request.proposalId);

        IPollManager dao = s_polls[gvid].dao;

        if( dao == IPollManager(address(0)) ) {
            revert makeVoteTransaction_404();
        }

        // User must be able to vote on the poll
        // so we don't waste gas submitting invalid transactions
        if( 0 == dao.canVoteOnPoll(in_request.proposalId, in_request.voter, in_data) ) {
            revert makeVoteTransaction_401();
        }

        // Validate EIP-712 signed voting request
        bytes32 requestDigest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                VOTINGREQUEST_TYPEHASH,
                in_request.voter,
                in_request.dao,
                in_request.proposalId,
                in_request.choiceId
            ))
        ));
        if( in_request.voter != ecrecover(requestDigest, uint8(in_rsv.v), in_rsv.r, in_rsv.s) ) {
            revert makeVoteTransaction_403();
        }

        // Encrypt request to authenticate it when we're invoked again
        bytes32 ciphertextNonce = keccak256(abi.encodePacked(encryptionSecret, requestDigest));

        // Choose a random keypair to submit the transaction from
        EthereumKeypair memory kp = internal_randomKeypair(gvid);

        // Return signed transaction invoking 'submitEncryptedVote'
        return EIP155Signer.sign(
            kp.addr,
            kp.secret,
            EIP155Signer.EthTx({
                nonce: kp.nonce,
                gasPrice: in_gasPrice,
                gasLimit: 250000,
                to: address(this),
                value: 0,
                chainId: block.chainid,
                data: abi.encodeWithSelector(
                    this.proxy.selector,
                    ciphertextNonce,
                    // Encrypt inner call, with DAO address as target
                    Sapphire.encrypt(
                        encryptionSecret,
                        ciphertextNonce,
                        abi.encode(
                            dao,
                            // Inner call to DAO contract
                            abi.encodeWithSelector(
                                dao.proxy.selector,
                                in_request.voter,
                                in_request.proposalId,
                                in_request.choiceId)),
                        ""))
            }));
    }

    // ------------------------------------------------------------------------

    error proxy_403();
    error proxy_500();

    function proxy(bytes32 ciphertextNonce, bytes memory ciphertext)
        external payable
    {
        EthereumKeypair storage kp;

        (,kp) = internal_keypairByAddress(msg.sender);
        if( kp.gvid == 0 ) {    // Keypair must exist and belong to the sender
            revert proxy_403();
        }

        bytes memory plaintext = Sapphire.decrypt(encryptionSecret, ciphertextNonce, ciphertext, "");

        (address addr, bytes memory subcall_data) = abi.decode(plaintext, (address, bytes));

        (bool success,) = addr.call{value: msg.value}(subcall_data);

        if( false == success ) {
            revert proxy_500();
        }

        kp.nonce += 1;
    }

    // ------------------------------------------------------------------------

    error withdraw_404();
    error withdraw_401();
    error withdraw_403();
    error withdraw_412();

    function withdraw(
        address in_dao,
        bytes32 in_proposalId,
        address in_keypairAddress,
        uint64 in_nonce,
        uint256 in_amount,
        uint256 in_gasPrice,
        SignatureRSV calldata rsv
    )
        external view
        returns (bytes memory transaction)
    {
        bytes32 gvid = internal_gvid(in_dao, in_proposalId);

        // poll must exist
        address owner = s_polls[gvid].owner;
        if( owner == address(0) ) {
            revert withdraw_404();
        }

        bytes32 inner_digest = keccak256(abi.encode(address(this), in_dao, in_proposalId));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", inner_digest));

        // Signature must be from owner
        if( owner != ecrecover(digest, uint8(rsv.v), rsv.r, rsv.s) ) {
            revert withdraw_401();
        }

        PollSettings storage poll;

        EthereumKeypair storage kp;

        (poll, kp) = internal_keypairByAddress(in_keypairAddress);

        // signer must be poll owner
        if( poll.owner != owner) {
            revert withdraw_403();
        }

        if( poll.closed == false ) {
            revert withdraw_412();  // Creator can only withdraw after closing poll
        }

        return EIP155Signer.sign(kp.addr, kp.secret, EIP155Signer.EthTx({
            nonce: in_nonce,
            gasPrice: in_gasPrice,
            gasLimit: 250000,
            to: owner,
            value: in_amount,
            data: "",
            chainId: block.chainid
        }));
    }
}
