import { expect } from "chai";
import { ethers } from "hardhat";
import { DAOv1, ProposalParamsStruct } from "../typechain-types/DAOv1";
import { BigNumber, BytesLike, TypedDataDomain, TypedDataField } from "ethers";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

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
    const dao = await DAOv1_factory.deploy(whitelist.address, ethers.constants.AddressZero);
    await dao.deployed();

    return {dao, whitelist}
  }

  async function deployDao(proxy?:string) {
    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    if( ! proxy ) {
      proxy = ethers.constants.AddressZero;
    }
    const dao = await DAOv1_factory.deploy(ethers.constants.AddressZero, proxy);
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
  });

  it('Should accept proxy votes', async function () {
    const signer = ethers.provider.getSigner(0);

    // Setup proxy signer contract
    const GaslessVoting_factory = await ethers.getContractFactory('GaslessVoting');
    const gv = await GaslessVoting_factory.deploy(await signer.getAddress(), {value: ethers.utils.parseEther('0.2')});
    await gv.deployed();

    // Configure DAO with proxy signer contract
    const { dao } = await deployDao(gv.address);
    await gv.setDAO(dao.address);

    // Add a proposal, and request to vote on it
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);
    const request = {
        voter: await signer.getAddress(),
        proposalId: proposalId,
        choiceId: 1
    };

    // Sign voting request
    const signature = await signer._signTypedData({
      name: "DAOv1.GaslessVoting",
      version: "1",
      chainId: await signer.getChainId(),
      verifyingContract: gv.address
    }, {
      VotingRequest: [
        { name: 'voter', type: "address" },
        { name: 'proposalId', type: 'bytes32' },
        { name: 'choiceId', type: 'uint256' }
      ]
    }, request);
    const rsv = ethers.utils.splitSignature(signature);

    // Submit voting request to get signed transaction
    const nonce = await gv.provider.getTransactionCount(await gv.signerAddr());
    const gasPrice = await gv.provider.getGasPrice();
    const tx = await gv.makeTransaction(nonce, gasPrice, request, rsv);

    // Submit signed transaction via plain JSON-RPC provider (avoiding saphire.wrap)
    const plain_provider = new StaticJsonRpcProvider(ethers.provider.connection);
    let plain_resp = await plain_provider.sendTransaction(tx);
    let receipt = await gv.provider.waitForTransaction(plain_resp.hash);

    const closed = await dao.closeProposal(proposalId);
    const closed_receipt = await closed.wait();
    expect(Number(closed_receipt.events![0].args!.topChoice)).to.equal(1);
  });
});
