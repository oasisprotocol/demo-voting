// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Types.sol"; // solhint-disable-line no-global-import

interface PollACLv1 {
    function canCreatePoll(address dao) external returns(bool);
    function onPollCreated(address dao, ProposalId proposalId, address creator) external;
    function canManagePoll(address dao, ProposalId proposalId, address user) external returns(bool);
    function canVoteOnPoll(address dao, ProposalId proposalId, address user) external returns(bool);
}
