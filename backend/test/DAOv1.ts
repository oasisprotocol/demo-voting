import { expect } from "chai";
import { ethers } from "hardhat";
import { DAOv1, ProposalParamsStruct } from "../typechain-types/DAOv1";

const TETS_PROPOSALS: ProposalParamsStruct[] = [
  {ipfsHash: "abcd123", numChoices: 3, publishVotes: true},
  {ipfsHash: "abc1234", numChoices: 3, publishVotes: true},
];

async function addProposals(dao:DAOv1) {
  for (const p of TETS_PROPOSALS) {
    await dao.createProposal(p);
  }
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

  async function deployDaoFixture() {
    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    const dao = await DAOv1_factory.deploy("0x0000000000000000000000000000000000000000");
    await dao.deployed();
    return { dao };
  }

  it("Should create proposals", async function () {
    const { dao } = await deployDaoFixture();

    await addProposals(dao);

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(TETS_PROPOSALS.length);
  });

  it("Should cast vote proposals", async function () {
    const { dao } = await deployDaoFixture();
    const createProposalTx = (await dao.createProposal(TETS_PROPOSALS[0]));
    const createProposalRc = await createProposalTx.wait();
    expect(createProposalRc.events).to.not.be.undefined;
    const createEvent = createProposalRc.events!.find(event => event.event === 'ProposalCreated');
    expect(createEvent).to.not.be.undefined;
    expect(createEvent!.args).to.not.be.undefined;
    const [proposalId] = createEvent!.args!;

    const acl_addr = await dao.acl();
    const acl = (await ethers.getContractFactory("SimplePollACLv1")).attach(acl_addr);

    // Whitelist the voter.
    //await (await acl.setAllowedPollVoters(proposalId, [(await ethers.getSigners())[0].address])).wait();
    await (await dao.castVote(proposalId, 2)).wait();

    const closeProposalTx = (await dao.closeProposal(proposalId));
    const closeProposalRc = await closeProposalTx.wait();
    expect(closeProposalRc.events).to.not.be.undefined;
    const closeEvent = closeProposalRc.events!.find(event => event.event === 'ProposalClosed');
    expect(closeEvent).to.not.be.undefined;
    expect(closeEvent!.args).to.not.be.undefined;
    const [_, topChoice] = closeEvent!.args!;

    expect(topChoice.toNumber()).to.equal(2);
  });
});
