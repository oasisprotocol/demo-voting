// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import { IPollACL } from "../../interfaces/IPollACL.sol";
import { IPollManagerACL } from "../../interfaces/IPollManagerACL.sol";
import { StorageProof } from "../xchain/StorageProof.sol";
import { AccountCache } from "../xchain/AccountCache.sol";
import { HeaderCache } from "../xchain/HeaderCache.sol";

// Restrict access to a poll using a storage proof for vote weight
contract StorageProofACL is IPollACL
{
    struct PollSettings {
        bytes32 block_hash;
        address account_address;
        uint256 slot;
    }

    struct PollCreationOptions {
        PollSettings settings;
        bytes headerRlpBytes;
        bytes rlpAccountProof;
    }

    mapping(bytes32 => PollSettings) private s_polls;

    StorageProof private storageProof;

    function internal_id(address in_dao, bytes32 in_proposalId)
        internal pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(in_dao, in_proposalId));
    }

    constructor( StorageProof in_storageProof )
    {
        storageProof = in_storageProof;
    }

    function supportsInterface(bytes4 interfaceId)
        public pure
        returns(bool)
    {
        return interfaceId == type(IPollACL).interfaceId;
    }

    function onPollCreated(bytes32 in_proposalId, address, bytes calldata in_data)
        external
    {
        bytes32 id = internal_id(msg.sender, in_proposalId);

        require( s_polls[id].block_hash == 0 );

        PollCreationOptions memory options = abi.decode(in_data, (PollCreationOptions));

        s_polls[id] = options.settings;

        AccountCache accountCache = storageProof.accountCache();

        HeaderCache headerCache = accountCache.headerCache();

        // Prime the header cache
        if( options.headerRlpBytes.length > 0 ) {
            if( ! headerCache.exists(options.settings.block_hash) ) {
                headerCache.add(options.headerRlpBytes);
            }
        }

        // Prime the account cache
        if( options.rlpAccountProof.length > 0 ) {
            if( ! accountCache.exists(options.settings.block_hash, options.settings.account_address) ) {
                accountCache.add(options.settings.block_hash, options.settings.account_address, options.rlpAccountProof);
            }
        }
    }

    function onPollClosed(bytes32 in_proposalId)
        external
    {
        delete s_polls[internal_id(msg.sender, in_proposalId)];
    }

    function canVoteOnPoll(
        address in_dao,
        bytes32 in_proposalId,
        address in_user,
        bytes calldata in_rlpStorageProof
    )
        external view
        returns(uint out_weight)
    {
        bytes32 id = internal_id(in_dao, in_proposalId);

        require( s_polls[id].block_hash != 0 );

        PollSettings memory settings = s_polls[id];

        // No input, cannot vote
        if( in_rlpStorageProof.length == 0 ) {
            return 0;
        }

        out_weight = uint256(storageProof.verifyStorage(
            settings.block_hash,
            settings.account_address,
            settings.slot,
            bytes32(bytes20(in_user)),
            in_rlpStorageProof
        ));
    }

    function canManagePoll(address in_dao, bytes32 in_proposalId, address)
        external view
        returns(bool)
    {
        return s_polls[internal_id(in_dao, in_proposalId)].block_hash != 0;
    }
}
