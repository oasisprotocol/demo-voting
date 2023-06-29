// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Types.sol"; // solhint-disable-line no-global-import

interface PollACLv1 {
    function canCreatePoll(address dao) external returns(bool);
    function setPollCreators(address dao, ProposalId proposalId, address[] calldata creators) external;

    function canManagePoll(address dao, ProposalId proposalId, address user) external returns(bool);
    function setPollManagers(address dao, ProposalId proposalId, address[] calldata admins) external;

    function canVoteOnPoll(address dao, ProposalId proposalId, address user) external returns(bool);
    function setAllowedPollVoters(address dao, ProposalId proposalId, address[] calldata voters) external;
}
