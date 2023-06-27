// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error NotTerminated();
error NotActive();

type ProposalId is bytes32;

struct ProposalParams {
    string ipfsHash;
    uint16 numChoices;
    bool publishVotes;
}

struct Outcome {
    address payable payee;
    uint128 payment;
}
