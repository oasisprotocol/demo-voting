import { expect } from "chai";
import { ethers } from "hardhat";
import { BytesLike, EventLog } from "ethers";

import { DAOv1, ProposalParamsStruct } from "../src/contracts/contracts/DAOv1";

const TEST_PROPOSALS: ProposalParamsStruct[] = [
  {ipfsHash: "abcd123", numChoices: 3, publishVotes: true},
  {ipfsHash: "abc1234", numChoices: 3, publishVotes: true},
];

async function addProposal(dao:DAOv1, proposal:ProposalParamsStruct) {
  const tx = (await dao.createProposal(proposal));
  const receipt = await tx.wait();
  expect(receipt!.logs).to.not.be.undefined;
  const createEvent = receipt!.logs.find(event => (event as EventLog).fragment.name === 'ProposalCreated') as EventLog;
  expect(createEvent).to.not.be.undefined;
  expect(createEvent!.args).to.not.be.undefined;
  return createEvent!.args![0] as BytesLike;
}

async function closeProposal(dao:DAOv1, proposalId:BytesLike) {
  const tx = await dao.closeProposal(proposalId);
  const receipt = await tx.wait();
  expect(receipt!.logs).to.not.be.undefined;
  const closeEvent = receipt!.logs.find(event => (event as EventLog).fragment.name === 'ProposalClosed') as EventLog | undefined;
  expect(closeEvent).to.not.be.undefined;
  expect(closeEvent!.args).to.not.be.undefined;
  const [_, topChoice] = closeEvent!.args;
  return topChoice as bigint;
}

describe("DAOv1", function () {
  async function deployDao(gaslessAddress?:string, aclName?:string) {
    let acl_address = ethers.ZeroAddress;
    if (aclName) {
      const ACLv1 = await ethers.getContractFactory(aclName);
      const acl = await ACLv1.deploy();
      await acl.waitForDeployment();
      acl_address = await acl.getAddress();
    }

    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    const dao = await DAOv1_factory.deploy(acl_address, gaslessAddress ?? ethers.ZeroAddress);
    await dao.waitForDeployment();

    return { dao, dao_address: await dao.getAddress(), acl_address };
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
    expect(topChoice).to.equal(2n);
    expect((await dao.getActiveProposals(0, 100)).length).to.equal(0);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(1);

    const signer_addr = (await ethers.getSigners())[0].address;

    expect(await dao.getVoteOf(proposalId, signer_addr)).to.include(2n);
    expect(await dao.getVoteCounts(proposalId)).to.deep.include(1n);
    expect(await dao.getVotes(proposalId)).to.deep.equal([[signer_addr], [2n]]);
  });

  it("Should cast vote on DAO with whitelist ACL", async function () {
    const { dao, dao_address, acl_address } = await deployDao(undefined, 'WhitelistVotersACLv1');
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(1);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(0);

    const acl = await ethers.getContractAt("WhitelistVotersACLv1", acl_address);

    // Whitelist the first voter.
    const signers = await ethers.getSigners();
    const evtx = await acl.setEligibleVoters(dao_address, proposalId, [signers[1].address]);
    await evtx.wait();

    // Connect to DAO instance with the first voter.
    const daoVoter = (await ethers.getContractAt("DAOv1", dao_address)).connect(signers[1]);
    const cvtx = await daoVoter.castVote(proposalId, 2n);
    cvtx.wait();

    // close the poll.
    const topChoice = await closeProposal(dao, proposalId);
    expect(topChoice).to.equal(2n);
    expect((await dao.getActiveProposals(0, 100)).length).to.equal(0);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(1);
    expect(await dao.getVoteOf(proposalId, signers[1].address)).to.include(2n);
    expect(await dao.getVoteCounts(proposalId)).to.deep.include(1n);
    expect(await dao.getVotes(proposalId)).to.deep.equal([[signers[1].address], [2n]]);
  });

  it('Should accept proxy votes', async function () {
    // This test requires RNG and runs on the Sapphire network only.
    // You can set up sapphire-dev image and run the test like this:
    // docker run -it -p8545:8545 -p8546:8546 ghcr.io/oasisprotocol/sapphire-dev -to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    // npx hardhat test --grep proxy --network sapphire-localnet
    if ((await ethers.provider.getNetwork()).chainId == 1337n) {
      this.skip();
    }
    const signer = await ethers.provider.getSigner(0);

    // Setup proxy signer contract
    const GaslessVoting_factory = await ethers.getContractFactory('GaslessVoting');
    const gv = await GaslessVoting_factory.deploy(signer.getAddress(), {value: ethers.parseEther('1')});
    await gv.waitForDeployment();
    const gv_address = await gv.getAddress();

    // Configure DAO with proxy signer contract
    const { dao, dao_address } = await deployDao(gv_address);
    await gv.setDAO(dao_address);

    // Add a proposal, and request to vote on it
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);
    const request = {
        voter: await signer.getAddress(),
        proposalId: proposalId,
        choiceId: 1
    };

    // Sign voting request
    const signature = await signer.signTypedData({
      name: "DAOv1.GaslessVoting",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: gv_address
    }, {
      VotingRequest: [
        { name: 'voter', type: "address" },
        { name: 'proposalId', type: 'bytes32' },
        { name: 'choiceId', type: 'uint256' }
      ]
    }, request);
    const rsv = ethers.Signature.from(signature);

    // Submit voting request to get signed transaction
    //const nonce = await gv.provider.getTransactionCount(await gv.signerAddr());
    const gasPrice = (await gv.runner?.provider?.getFeeData())?.gasPrice!;
    const tx = await gv.makeVoteTransaction(gasPrice, request, rsv);
    const provider = gv.runner?.provider!;

    // Submit signed transaction via plain JSON-RPC provider (avoiding saphire.wrap)
    let plain_resp = await provider.broadcastTransaction(tx);
    await plain_resp.wait();

    const closed = await dao.closeProposal(proposalId);
    const closed_receipt = await closed.wait();
    expect((closed_receipt!.logs![0] as EventLog).args!.topChoice).to.equal(1n);
  });
});
