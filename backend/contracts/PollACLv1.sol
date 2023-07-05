// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Types.sol"; // solhint-disable-line no-global-import

// Generic ACL interface for DAO polls.
//
// Write functions for setting actual permissions are not part of this
// interface and should be specific to ACL implementations and specific dApp.
interface PollACLv1 {
    error ACLManagementNotAllowed();
    error PollCreationNotAllowed();
    error PollManagementNotAllowed();
    error VoteNotAllowed();

    // Can a given user create a new poll.
    function canCreatePoll(address dao, address user) external returns(bool);

    // DAO callback function when a new poll was created. This is typically invoked
    // to assign poll creator as its manager.
    function onPollCreated(address dao, ProposalId proposalId, address creator) external;

    // Can a given user manage poll (e.g. close the poll, add eligible voters).
    function canManagePoll(address dao, ProposalId proposalId, address user) external returns(bool);

    // Is a given user eligible voter for the given poll.
    function canVoteOnPoll(address dao, ProposalId proposalId, address user) external returns(bool);
}
