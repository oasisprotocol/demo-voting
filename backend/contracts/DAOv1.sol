// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./Types.sol"; // solhint-disable-line no-global-import
import "./BallotBoxV1.sol"; // solhint-disable-line no-global-import
import "./SimplePollACLv1.sol"; // solhint-disable-line no-global-import

contract DAOv1 {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error AlreadyExists();
    error NoChoices();
    error TooManyChoices();

    event ProposalCreated(ProposalId id);
    event ProposalClosed(ProposalId id, uint256 topChoice);

    struct Proposal {
        bool active;
        uint16 topChoice;
        ProposalParams params;
    }

    struct ProposalWithId {
        ProposalId id;
        Proposal proposal;
    }

    mapping(ProposalId => Proposal) public proposals;
    EnumerableSet.Bytes32Set private activeProposals;
    ProposalId[] private pastProposals;
    BallotBoxV1 public immutable ballotBox;
    PollACLv1 public immutable acl;

    // Stores (dao, ProposalID) => list of allowed voters.
    // This is always in sync with acl.setAllowedPollVoters(), but is in form of
    // a list here for managing it.
    mapping (bytes32 => address[]) allowedPollVotersList;

    constructor(PollACLv1 a) {
        acl = (address(a) == address(0)) ? new SimplePollACLv1() : a;
        ballotBox = new BallotBoxV1();
    }

    function createProposal(ProposalParams calldata _params) external returns (ProposalId) {
        bytes32 proposalHash = keccak256(abi.encode(msg.sender, _params));
        ProposalId proposalId = ProposalId.wrap(proposalHash);
        if (_params.numChoices == 0) revert NoChoices();
        if (_params.numChoices > type(uint16).max) revert TooManyChoices();
        if (proposals[proposalId].active) revert AlreadyExists();
        Proposal storage proposal = proposals[proposalId];
        proposal.params = _params;
        proposal.active = true;
        activeProposals.add(proposalHash);
        ballotBox.createBallot(abi.encode(proposalId, _params));
        address[] memory a = new address[](1);
        a[0] = msg.sender;
        acl.setPollManagers(address(this), proposalId, a);
        emit ProposalCreated(proposalId);
        return proposalId;
    }

    function getActiveProposals(
        uint256 _offset,
        uint256 _count
    ) external view returns (ProposalWithId[] memory _proposals) {
        if (_offset + _count > activeProposals.length()) {
            _count = activeProposals.length() - _offset;
        }
        _proposals = new ProposalWithId[](_count);
        for (uint256 i; i < _count; ++i) {
            ProposalId id = ProposalId.wrap(activeProposals.at(_offset + i));
            _proposals[i] = ProposalWithId({id: id, proposal: proposals[id]});
        }
    }

    function castVote(ProposalId proposalId, uint256 choiceIdBig) external {
        require(acl.canVoteOnPoll(address(this), proposalId, msg.sender), "Vote not allowed");
        return ballotBox.castVote(proposalId, choiceIdBig);
    }

    function listAllowedPollVoters(ProposalId proposalId) external returns(address[] memory) {
        require(acl.canManagePoll(address(this), proposalId, msg.sender), "Poll management not allowed");
        return allowedPollVotersList[keccak256(abi.encode(address(this), proposalId))];
    }

    function setAllowedPollVoters(ProposalId proposalId, address[] calldata voters) external {
        require(acl.canManagePoll(address(this), proposalId, msg.sender), "Poll management not allowed");
        acl.setAllowedPollVoters(address(this), proposalId, voters);
    }

    function getPastProposals(
        uint256 _offset,
        uint256 _count
    ) external view returns (ProposalWithId[] memory _proposals) {
        if (_offset + _count > pastProposals.length) {
            _count = pastProposals.length - _offset;
        }
        _proposals = new ProposalWithId[](_count);
        for (uint256 i; i < _count; ++i) {
            ProposalId id = pastProposals[_offset + i];
            _proposals[i] = ProposalWithId({id: id, proposal: proposals[id]});
        }
    }

    function closeProposal(ProposalId proposalId) external payable {
        require(acl.canManagePoll(address(this), proposalId, msg.sender), "Poll management not allowed");
        uint256 topChoice = ballotBox.closeBallot(proposalId);
        proposals[proposalId].topChoice = uint16(topChoice);
        proposals[proposalId].active = false;
        activeProposals.remove(ProposalId.unwrap(proposalId));
        pastProposals.push(proposalId);
        emit ProposalClosed(proposalId, topChoice);
    }
}
