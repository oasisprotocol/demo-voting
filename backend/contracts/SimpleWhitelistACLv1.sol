// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PollACLv1.sol"; // solhint-disable-line no-global-import

// Simple ACL where:
// - anyone can create a poll
// - poll admins can close the ballot
// - whitelisted voters can vote on particular ballot
contract SimpleWhitelistACLv1 is PollACLv1 {
    mapping (bytes32 => mapping(address => bool)) pollAdmins; // Stores (dao, ProposalID, admin) triplet.
    mapping (bytes32 => mapping(address => bool)) allowedPollVoters; // (dao, ProposalID, allowed voter) triplet.
    // Stores (dao, ProposalID) => list of allowed voters.
    // This is always in sync with acl.setAllowedPollVoters(), but is in form of
    // a list here for managing it.
    mapping (bytes32 => address[]) allowedPollVotersList;

    address _owner;

    constructor() {
        _owner = msg.sender; // only DAO contract can change the contract.
    }

    function canCreatePoll(address) public pure returns(bool) {
        // Anyone can create a poll.
        return true;
    }

    function setPollCreators(address, ProposalId, address[] calldata) public {
        // Anyone can create a poll.
    }

    function canManagePoll(address dao, ProposalId proposalId, address user) public view returns(bool) {
        return pollAdmins[keccak256(abi.encode(dao, proposalId))][user] == true;
    }

    function onPollCreated(address dao, ProposalId proposalId, address creator)
        external
    {
        // Do nothing
    }

    function listAllowedPollVoters(ProposalId proposalId)
        external view
        returns(address[] memory)
    {
        return allowedPollVotersList[keccak256(abi.encode(address(this), proposalId))];
    }

    function setPollManagers(address dao, ProposalId proposalId, address[] calldata admins) public {
        require(msg.sender==_owner, "ACL changes not allowed");
        mapping(address => bool) storage adminsMap = pollAdmins[keccak256(abi.encode(dao, proposalId))];
        for (uint i=0; i<admins.length; i++) {
            adminsMap[admins[i]] = true;
        }
    }

    function canVoteOnPoll(address dao, ProposalId proposalId, address user)
        public view
        returns(bool) {
        return allowedPollVoters[keccak256(abi.encode(dao, proposalId))][user] == true;
    }

    function setAllowedPollVoters(address dao, ProposalId proposalId, address[] calldata voters)
        external
    {
        require(msg.sender == _owner, "ACL changes not allowed");

        mapping(address => bool) storage allowedVotersMap = allowedPollVoters[keccak256(abi.encode(dao, proposalId))];
        for (uint i=0; i<voters.length; i++) {
            allowedVotersMap[voters[i]] = true;
        }
    }

}
