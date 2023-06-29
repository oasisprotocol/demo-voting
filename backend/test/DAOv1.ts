import { expect } from "chai";
import { ethers } from "hardhat";
import { ProposalParamsStruct } from "../typechain-types/DAOv1";
import {BigNumber} from "ethers";

describe("DAOv1", function () {
  async function deployDaoFixture() {
    const proposals: ProposalParamsStruct[] = [
      {ipfsHash: "abcd123", numChoices: 3, publishVotes: true},
      {ipfsHash: "abc1234", numChoices: 3, publishVotes: true},
    ];

    const DAOv1 = await ethers.getContractFactory("DAOv1");
    // XXX: Can we change "0x0..." to null, undefined, address(0) or just have it optional?
    const dao = await DAOv1.deploy("0x0000000000000000000000000000000000000000");

    return { dao, proposals };
  }

  it("Should create proposals", async function () {
    const { dao, proposals } = await deployDaoFixture();

    for (const p of proposals) {
      await dao.createProposal(p);
    }

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(proposals.length);
  });

  it("Should cast vote proposals", async function () {
    const { dao, proposals } = await deployDaoFixture();
    const createProposalTx = (await dao.createProposal(proposals[0]));
    const createProposalRc = await createProposalTx.wait();
    expect(createProposalRc.events).to.not.be.undefined;
    const createEvent = createProposalRc.events!.find(event => event.event === 'ProposalCreated');
    expect(createEvent).to.not.be.undefined;
    expect(createEvent!.args).to.not.be.undefined;
    const [proposalId] = createEvent!.args!;

    // Whitelist the voter.
    await (await dao.setAllowedPollVoters(proposalId, [(await ethers.getSigners())[0].address])).wait();
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
