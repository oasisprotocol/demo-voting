// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

type ProposalId is bytes32;

struct ProposalParams {
    string ipfsHash;
    uint16 numChoices;
    bool publishVotes;
}

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
    function canCreatePoll(address dao, address user) external view returns(bool);

    // DAO callback function when a new poll was created. This is typically invoked
    // to assign poll creator as its manager.
    function onPollCreated(address dao, ProposalId proposalId, address creator) external;

    // Can a given user manage poll (e.g. close the poll, add eligible voters).
    function canManagePoll(address dao, ProposalId proposalId, address user) external view returns(bool);

    // Is a given user eligible voter for the given poll.
    function canVoteOnPoll(address dao, ProposalId proposalId, address user) external view returns(bool);
}

interface ERC165 {
    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return `true` if the contract implements `interfaceID` and
    ///  `interfaceID` is not 0xffffffff, `false` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface AcceptsProxyVotes {
    function proxyVote(address voter, ProposalId proposalId, uint256 choiceIdBig) external;
    function getACL() external view returns (PollACLv1);
}
