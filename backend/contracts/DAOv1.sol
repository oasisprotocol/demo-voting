// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@opengsn/contracts/src/ERC2771Recipient.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./Types.sol"; // solhint-disable-line no-global-import
import "./AllowAllACLv1.sol"; // solhint-disable-line no-global-import

contract DAOv1 is ERC2771Recipient {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error AlreadyExists();
    error NoChoices();
    error TooManyChoices();
    error NotPublishingVotes();
    error AlreadyVoted();
    error UnknownChoice();
    error NotActive();

    event ProposalCreated(ProposalId id);
    event ProposalClosed(ProposalId indexed id, uint256 topChoice);

    struct Proposal {
        bool active;
        ProposalParams params;
        uint8 topChoice;
    }

    struct ProposalWithId {
        ProposalId id;
        Proposal proposal;
    }

    struct Choice {
        bool exists;
        uint8 choice;
    }

    uint256 constant MAX_CHOICES = 32;

    struct Ballot {
        /// voter -> choice id
        mapping(address => Choice) votes;
        /// choice id -> vote
        uint256[MAX_CHOICES] voteCounts;
    }

    // Confidential storage.
    mapping(ProposalId => Ballot) private _ballots;

    // Public storage.
    PollACLv1 public immutable acl;
    mapping(ProposalId => Proposal) public proposals;
    EnumerableSet.Bytes32Set private activeProposals; // NB: Recursive structs cannot be public.
    ProposalId[] public pastProposals;

    constructor(PollACLv1 a) {
        acl = (address(a) == address(0)) ? new AllowAllACLv1() : a;
        _setTrustedForwarder(address(0xf60B5073AEa203EA650B56BC58Ee8853ED1F5e66));
    }

    function createProposal(ProposalParams calldata _params)
        external
        returns (ProposalId)
    {
        if (_params.numChoices == 0) revert NoChoices();
        if (_params.numChoices > MAX_CHOICES) revert TooManyChoices();
        if (!acl.canCreatePoll(address(this), msg.sender)) revert PollACLv1.PollCreationNotAllowed();

        bytes32 proposalHash = keccak256(abi.encode(msg.sender, _params));
        ProposalId proposalId = ProposalId.wrap(proposalHash);
        if (proposals[proposalId].active) revert AlreadyExists();

        proposals[proposalId] = Proposal({active: true, params:_params, topChoice:0});
        activeProposals.add(proposalHash);

        Ballot storage ballot = _ballots[proposalId];
        for (uint256 i; i < _params.numChoices; ++i)
        {
            ballot.voteCounts[i] = 1 << 255; // gas usage side-channel resistance.
        }

        acl.onPollCreated(address(this), proposalId, msg.sender);
        emit ProposalCreated(proposalId);
        return proposalId;
    }

    function getActiveProposals(uint256 _offset, uint256 _count)
        external view
        returns (ProposalWithId[] memory _proposals)
    {
        if (_offset + _count > activeProposals.length()) {
            _count = activeProposals.length() - _offset;
        }

        _proposals = new ProposalWithId[](_count);
        for (uint256 i; i < _count; ++i)
        {
            ProposalId id = ProposalId.wrap(activeProposals.at(_offset + i));
            _proposals[i] = ProposalWithId({id: id, proposal: proposals[id]});
        }
    }

    function castVote(ProposalId proposalId, uint256 choiceIdBig)
        external
    {
        if (!acl.canVoteOnPoll(address(this), proposalId, _msgSender())) revert PollACLv1.VoteNotAllowed();

        Proposal storage proposal = proposals[proposalId];
        if (!proposal.active) revert NotActive();
        Ballot storage ballot = _ballots[proposalId];
        uint8 choiceId = uint8(choiceIdBig & 0xff);
        if (choiceId >= proposal.params.numChoices) revert UnknownChoice();
        Choice memory existingVote = ballot.votes[_msgSender()];

        // 1 click 1 vote.
        for (uint256 i; i < proposal.params.numChoices; ++i)
        {
            // read-modify-write all counts to make it harder to determine which one is chosen.
            ballot.voteCounts[i] ^= 1 << 255; // flip the top bit to constify gas usage a bit
            // Arithmetic is not guaranteed to be constant time, so this might still leak the choice to a highly motivated observer.
            ballot.voteCounts[i] += i == choiceId ? 1 : 0;
            ballot.voteCounts[i] -= existingVote.exists && existingVote.choice == i
            ? 1
            : 0;
        }

        ballot.votes[_msgSender()].exists = true;
        ballot.votes[_msgSender()].choice = choiceId;
    }

    function getPastProposals(uint256 _offset, uint256 _count)
        external view
        returns (ProposalWithId[] memory _proposals)
    {
        if (_offset + _count > pastProposals.length) {
            _count = pastProposals.length - _offset;
        }

        _proposals = new ProposalWithId[](_count);

        for (uint256 i; i < _count; ++i)
        {
            ProposalId id = pastProposals[_offset + i];
            _proposals[i] = ProposalWithId({id: id, proposal: proposals[id]});
        }
    }

    function closeProposal(ProposalId proposalId)
        external
    {
        if (!acl.canManagePoll(address(this), proposalId, msg.sender)) revert PollACLv1.PollManagementNotAllowed();

        Proposal storage proposal = proposals[proposalId];
        if (!proposal.active) revert NotActive();

        Ballot storage ballot = _ballots[proposalId];

        uint256 topChoice;
        uint256 topChoiceCount;
        for (uint8 i; i < proposal.params.numChoices; ++i)
        {
            uint256 choiceVoteCount = ballot.voteCounts[i] & (type(uint256).max >> 1);
            if (choiceVoteCount > topChoiceCount)
            {
                topChoice = i;
                topChoiceCount = choiceVoteCount;
            }
        }

        delete _ballots[proposalId];
        proposals[proposalId].topChoice = uint8(topChoice);
        proposals[proposalId].active = false;
        activeProposals.remove(ProposalId.unwrap(proposalId));
        pastProposals.push(proposalId);
        emit ProposalClosed(proposalId, topChoice);
    }

    function getVoteOf(ProposalId proposalId, address voter)
        external view
        returns (Choice memory)
    {
        Proposal storage proposal = proposals[proposalId];

        if (!proposal.active) revert NotActive();
        Ballot storage ballot = _ballots[proposalId];

        if (voter == msg.sender) return ballot.votes[msg.sender];
        if (!proposal.params.publishVotes) revert NotPublishingVotes();
        return ballot.votes[voter];
    }

    function ballotIsActive(ProposalId id)
        external view
        returns (bool)
    {
        return proposals[id].active;
    }
}
