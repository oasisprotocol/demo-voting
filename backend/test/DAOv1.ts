import { expect } from "chai";
import { ethers } from "hardhat";
import { DAOv1, ProposalParamsStruct } from "../typechain-types/DAOv1";
import {BytesLike} from "ethers";

const TEST_PROPOSALS: ProposalParamsStruct[] = [
  {ipfsHash: "abcd123", numChoices: 3, publishVotes: true},
  {ipfsHash: "abc1234", numChoices: 3, publishVotes: true},
];

async function addProposal(dao:DAOv1, proposal:ProposalParamsStruct) {
  const createProposalTx = (await dao.createProposal(proposal));
  const createProposalRc = await createProposalTx.wait();
  expect(createProposalRc.events).to.not.be.undefined;
  const createEvent = createProposalRc.events!.find(event => event.event === 'ProposalCreated');
  expect(createEvent).to.not.be.undefined;
  expect(createEvent!.args).to.not.be.undefined;
  return createEvent!.args![0];
}

async function closeProposal(dao:DAOv1, proposalId:BytesLike) {
  const closeProposalTx = (await dao.closeProposal(proposalId));
  const closeProposalRc = await closeProposalTx.wait();
  expect(closeProposalRc.events).to.not.be.undefined;
  const closeEvent = closeProposalRc.events!.find(event => event.event === 'ProposalClosed');
  expect(closeEvent).to.not.be.undefined;
  expect(closeEvent!.args).to.not.be.undefined;
  const [_, topChoice] = closeEvent!.args!;
  return topChoice
}

describe("DAOv1", function () {
  async function deployDaoWithWhitelistACL() {
    const SimpleWhitelistACLv1_factory = await ethers.getContractFactory("SimpleWhitelistACLv1");
    const whitelist = await SimpleWhitelistACLv1_factory.deploy();
    await whitelist.deployed()

    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    const dao = await DAOv1_factory.deploy(whitelist.address);
    await dao.deployed();

    return {dao, whitelist}
  }

  async function deployDao() {
    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    const dao = await DAOv1_factory.deploy(ethers.constants.AddressZero);
    await dao.deployed();
    return { dao };
  }

  it("Should create proposals", async function () {
    const { dao } = await deployDao();

    for (const p of TEST_PROPOSALS) {
      await addProposal(dao, p);
    }

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(TEST_PROPOSALS.length);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(0);
  });

  it("Should cast vote on DAO with allow all ACL", async function () {
    const { dao } = await deployDao();
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(1);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(0);

    await (await dao.castVote(proposalId, 2)).wait();
    const topChoice = await closeProposal(dao, proposalId);
    expect(topChoice.toNumber()).to.equal(2);
    expect((await dao.getActiveProposals(0, 100)).length).to.equal(0);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(1);
  });

  it("Should cast vote on DAO with whitelist ACL", async function () {
    const { dao } = await deployDaoWithWhitelistACL();
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(1);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(0);

    const acl = (await ethers.getContractFactory("SimpleWhitelistACLv1")).attach(await dao.acl());
    // Whitelist the first voter.
    await (await acl.setEligibleVoters(dao.address, proposalId, [(await ethers.getSigners())[1].address])).wait();

    // Connect to DAO instance with the first voter.
    const daoVoter = (await (await ethers.getContractFactory("DAOv1")).attach(dao.address)).connect((await ethers.getSigners())[1]);
    await (await daoVoter.castVote(proposalId, 2)).wait();
    const aclVoter = acl.connect((await ethers.getSigners())[1]);

    // close the poll.
    const topChoice = await closeProposal(dao, proposalId);
    expect(topChoice.toNumber()).to.equal(2);
    expect((await dao.getActiveProposals(0, 100)).length).to.equal(0);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(1);
  });});
