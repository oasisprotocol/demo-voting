// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ProposalId, ProposalParams } from "./Types.sol";
import { PollACLv1 } from "./PollACLv1.sol";

interface AcceptsProxyVotes {
    function createProposal(ProposalParams calldata _params) external returns (ProposalId);
    function proxyVote(address voter, ProposalId proposalId, uint256 choiceIdBig) external;
    function getACL() external view returns (PollACLv1);
}
