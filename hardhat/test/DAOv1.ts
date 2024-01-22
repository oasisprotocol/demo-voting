import { expect } from "chai";
import { ethers } from "hardhat";
import {BigNumber, BytesLike, Contract} from "ethers";
import { JsonRpcSigner, StaticJsonRpcProvider } from "@ethersproject/providers";

import { DAOv1, ProposalParamsStruct } from "../typechain-types/contracts/DAOv1";

const TEST_PROPOSALS: ProposalParamsStruct[] = [
  {ipfsHash: "abcd123", numChoices: 3, publishVotes: true},
  {ipfsHash: "abc1234", numChoices: 3, publishVotes: true},
];

async function signVotingRequest(signer:JsonRpcSigner, gv_address:string, request:any) {
  const signature = await signer._signTypedData({
    name: "DAOv1.GaslessVoting",
    version: "1",
    chainId: await signer.getChainId(),
    verifyingContract: gv_address
  }, {
    VotingRequest: [
      { name: 'voter', type: "address" },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'choiceId', type: 'uint256' }
    ]
  }, request);
  return ethers.utils.splitSignature(signature);
}

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
  async function deployDao(gaslessAddress?:string, aclName?:string) {
    let acl: Contract | undefined;
    if (aclName) {
      const ACLv1 = await ethers.getContractFactory(aclName);
      acl = await ACLv1.deploy();
      await acl.deployed()
    }

    const DAOv1_factory = await ethers.getContractFactory("DAOv1");
    const dao = await DAOv1_factory.deploy(acl ? acl.address : ethers.constants.AddressZero, gaslessAddress ?? ethers.constants.AddressZero);
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
    expect(await dao.getVoteOf(proposalId, (await ethers.getSigners())[0].address)).to.include(2);
    expect(await dao.getVoteCounts(proposalId)).to.deep.include(BigNumber.from(1));
    expect(await dao.getVotes(proposalId)).to.deep.equal([[(await ethers.getSigners())[0].address], [2]]);
  });

  it("Should cast vote on DAO with whitelist ACL", async function () {
    const { dao } = await deployDao(undefined, 'WhitelistVotersACLv1');
    const proposalId = await addProposal(dao, TEST_PROPOSALS[0]);

    expect((await dao.getActiveProposals(0, 100)).length).to.equal(1);
    expect((await dao.getPastProposals(0, 100)).length).to.equal(0);

    const acl = (await ethers.getContractFactory("WhitelistVotersACLv1")).attach(await dao.getACL());
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
    expect(await dao.getVoteOf(proposalId, (await ethers.getSigners())[1].address)).to.include(2);
    expect(await dao.getVoteCounts(proposalId)).to.deep.include(BigNumber.from(1));
    expect(await dao.getVotes(proposalId)).to.deep.equal([[(await ethers.getSigners())[1].address], [2]]);
  });

  it('Should accept proxy votes', async function () {
    // This test requires RNG and runs on the Sapphire network only.
    // You can set up sapphire-dev image and run the test like this:
    // docker run -it -p8545:8545 -p8546:8546 ghcr.io/oasisprotocol/sapphire-dev -to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    // npx hardhat test --grep proxy --network sapphire-localnet
    if ((await ethers.provider.getNetwork()).chainId == 1337) {
      this.skip();
    }
    const signer = ethers.provider.getSigner(0);

    // Setup proxy signer contract
    console.log('    - Deploying GaslessVoting');
    const GaslessVoting_factory = await ethers.getContractFactory('GaslessVoting');
    const gv = await GaslessVoting_factory.deploy(signer.getAddress(), {value: ethers.utils.parseEther('1')});
    await gv.deployed();
    console.log('      =', gv.address);

    // Configure DAO with proxy signer contract
    console.log('    - Deploying DAOv1');
    const { dao } = await deployDao(gv.address);
    await gv.setDAO(dao.address);
    console.log('      =', dao.address);

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
    //const nonce = await gv.provider.getTransactionCount(await gv.signerAddr());
    const gasPrice = await gv.provider.getGasPrice();
    const tx = await gv.makeVoteTransaction(gasPrice, request, rsv);

    // Submit signed transaction via plain JSON-RPC provider (avoiding saphire.wrap)
    console.log('    - Submitting vote transaction');
    const plain_provider = new StaticJsonRpcProvider(ethers.provider.connection);
    let plain_resp = await plain_provider.sendTransaction(tx);
    let receipt = await gv.provider.waitForTransaction(plain_resp.hash);
    console.log('      =', receipt.transactionHash);

    console.log('    - Closing Proposal');
    const closed = await dao.closeProposal(proposalId);
    const closed_receipt = await closed.wait();
    expect(Number(closed_receipt.events![0].args!.topChoice)).to.equal(1);
  });
});
