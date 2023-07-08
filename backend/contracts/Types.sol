// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

type ProposalId is bytes32;

struct ProposalParams {
    string ipfsHash;
    uint16 numChoices;
    bool publishVotes;
}

interface AcceptsProxyVotes {
    function proxyVote(address voter, ProposalId proposalId, uint256 choiceIdBig) external;
}
