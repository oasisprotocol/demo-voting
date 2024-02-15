import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { AbiCoder, BytesLike, EventLog, ZeroHash, decodeRlp, encodeRlp, getBigInt, getBytes, parseEther, solidityPackedKeccak256, zeroPadValue } from "ethers";

import { PollManager, TokenHolderACL, AllowAllACL, VoterAllowListACL, GaslessVoting, StorageProofACL, HeaderCache, StorageProof, AccountCache } from "../src/contracts";
import { BLOCK_HEADERS, WMATIC_BALANCE } from "./exampleproofs";

async function addProposal(dao:PollManager, proposal:PollManager.ProposalParamsStruct, aclData?:Uint8Array) {
  const tx = await dao.create(proposal, aclData ?? new Uint8Array([]));
  const receipt = await tx.wait();
  expect(receipt!.logs).to.not.be.undefined;
  const createEvent = receipt!.logs.find(event => (event as EventLog).fragment.name === 'ProposalCreated') as EventLog;
  expect(createEvent).to.not.be.undefined;
  expect(createEvent!.args).to.not.be.undefined;
  return createEvent!.args![0] as BytesLike;
}

async function closeProposal(dao:PollManager, proposalId:BytesLike) {
  const tx = await dao.close(proposalId);
  const receipt = await tx.wait();
  expect(receipt!.logs).to.not.be.undefined;
  const closeEvent = receipt!.logs.find(event => (event as EventLog).fragment.name === 'ProposalClosed') as EventLog | undefined;
  expect(closeEvent).to.not.be.undefined;
  expect(closeEvent!.args).to.not.be.undefined;
  const [_, topChoice] = closeEvent!.args;
  return topChoice as bigint;
}

describe("PollManager", function () {
  let acl_tokenholder : TokenHolderACL;
  let acl_allowall : AllowAllACL;
  let acl_voterlist : VoterAllowListACL;
  let acl_storageproof : StorageProofACL;
  let storageProof: StorageProof;
  let accountCache: AccountCache;
  let headerCache: HeaderCache;
  let pm : PollManager;
  let gv : GaslessVoting;
  let TEST_PROPOSALS: PollManager.ProposalParamsStruct[];

  before(async () => {
    acl_allowall = await (await ethers.getContractFactory('AllowAllACL')).deploy();
    await acl_allowall.waitForDeployment();

    acl_tokenholder = await (await ethers.getContractFactory('TokenHolderACL')).deploy()
    await acl_tokenholder.waitForDeployment();

    acl_voterlist = await (await ethers.getContractFactory('VoterAllowListACL')).deploy()
    await acl_voterlist.waitForDeployment();

    headerCache = await (await ethers.getContractFactory('HeaderCache')).deploy();
    await headerCache.waitForDeployment();

    accountCache = await (await ethers.getContractFactory('AccountCache')).deploy(await headerCache.getAddress());
    await accountCache.waitForDeployment();

    storageProof = await (await ethers.getContractFactory('StorageProof')).deploy(await accountCache.getAddress());
    await storageProof.waitForDeployment();

    acl_storageproof = await (await ethers.getContractFactory('StorageProofACL')).deploy(await storageProof.getAddress());
    await acl_storageproof.waitForDeployment();

    gv = await (await ethers.getContractFactory('GaslessVoting')).deploy()
    await gv.waitForDeployment();

    const acl_allowall_addr = await acl_allowall.getAddress();

    pm = await (await ethers.getContractFactory('PollManager')).deploy(
      acl_allowall_addr,
      await gv.getAddress());
    await pm.waitForDeployment();

    TEST_PROPOSALS = [
      {ipfsHash: "0xabcd", ipfsSecret: ZeroHash, numChoices: 3n, publishVotes: true, closeTimestamp: 0n, acl: acl_allowall_addr},
      {ipfsHash: "0xdef0", ipfsSecret: ZeroHash, numChoices: 3n, publishVotes: true, closeTimestamp: 0n, acl: acl_allowall_addr},
    ]
  });

  it("Proposals and pagination", async function () {
    const ap_before = await pm.getActiveProposals(0, 0);
    const pp_before = await pm.getPastProposals(0, 0);
    expect(pp_before.out_proposals.length).eq(0);
    expect(ap_before.out_proposals.length).eq(0);

    for (const p of TEST_PROPOSALS) {
      await addProposal(pm, p);
    }

    const ap_after = await pm.getActiveProposals(0, TEST_PROPOSALS.length);
    const pp_after = await pm.getPastProposals(0, 0);

    expect(pp_after.out_count).eq(pp_before.out_count);
    expect(ap_after.out_count).eq(ap_before.out_count + BigInt(TEST_PROPOSALS.length));

    // Verify active proposals are listed in reverse order
    // This also verifies pagination works correctly
    for( let i = 0; i < TEST_PROPOSALS.length; i++ ) {
      const p = TEST_PROPOSALS[TEST_PROPOSALS.length - 1 - i];
      const ap_paginated = await pm.getActiveProposals(i, 1);
      expect(ap_paginated.out_proposals.length).eq(1);

      const x = ap_paginated.out_proposals[0].proposal.params;
      expect(x.ipfsHash).eq(p.ipfsHash);
      expect(x.numChoices).eq(p.numChoices);
      expect(x.publishVotes).eq(p.publishVotes);
      expect(x.closeTimestamp).eq(p.closeTimestamp);
      expect(x.acl).eq(p.acl);
    }

    // Then verify that when we close proposals
    // They get added to the top of the 'past proposals' list
  });

  it('Test TokenACL', async function () {
    const factory_TestToken = await ethers.getContractFactory('TestToken');
    const contract_TestToken = await factory_TestToken.deploy();
    contract_TestToken.waitForDeployment();

    const signers = await ethers.getSigners();
    const mint_tx = await contract_TestToken.mint(signers[0].address, parseEther('1'));
    await mint_tx.wait();

    const abi = AbiCoder.defaultAbiCoder();
    const aclParams = getBytes(abi.encode(["address"], [await contract_TestToken.getAddress()]));

    const propId = await addProposal(pm, {
      ipfsHash: "0xabcdblahblah",
      ipfsSecret: ZeroHash,
      numChoices: 3n,
      publishVotes: false,
      closeTimestamp: 0n,
      acl: await acl_tokenholder.getAddress()
    }, aclParams);

    // We should be able to vote, because we have the token
    const vote_tx = await pm.vote(propId, 1, new Uint8Array([]));
    await vote_tx.wait();

    // Now lets burn our tokens, and verify we can't vote
    const burn_tx = await contract_TestToken.burn(await contract_TestToken.balanceOf(signers[0].address));
    await burn_tx.wait();
    expect(await contract_TestToken.balanceOf(signers[0].address)).eq(0n);

    try {
      const badVote_tx = await pm.vote(propId, 1, new Uint8Array([]));
      await badVote_tx.wait();
      expect(false).eq(false);
    }
    catch( e:any ) {
      expect(true).eq(true);
    }
  });

  it('Test StorageProof ACL', async function () {
    const blockHash = '0xcb6242f4219a09f7ef7dfd51f7594b23d2a6ad1e06b8b99a55fef4ec82cf61af';
    const abi = AbiCoder.defaultAbiCoder();
    const headerRlpBytes = BLOCK_HEADERS[blockHash];
    const rlpAccountProof = encodeRlp(WMATIC_BALANCE.proof.accountProof.map(decodeRlp));
    const aclParams = getBytes(abi.encode(["tuple(tuple(bytes32,address,uint256),bytes,bytes)"], [
      [ // PollCreationOptions
        [ // PollSettings
          blockHash, WMATIC_BALANCE.proof.address, 3
        ],
        headerRlpBytes,
        rlpAccountProof
      ]
    ]));

    const propId = await addProposal(pm, {
      ipfsHash: "0xabcdblahblahstuff",
      ipfsSecret: ZeroHash,
      numChoices: 3n,
      publishVotes: false,
      closeTimestamp: 0n,
      acl: await acl_storageproof.getAddress()
    }, aclParams);

    // Impersonate
    const [fundedSigner] = await ethers.getSigners();
    const impersonatedAddr = WMATIC_BALANCE.slots[0].key;
    const fundTx = await fundedSigner.sendTransaction({
      to: impersonatedAddr,
      value: parseEther("1"),
      data: "0x"
    });
    await fundTx.wait();

    const voteProof = encodeRlp(WMATIC_BALANCE.proof.storageProof[0].proof.map(decodeRlp));
    const signer = await ethers.getImpersonatedSigner(impersonatedAddr);
    const newPm = pm.connect(signer);
    const vote_tx = await newPm.vote(propId, 1, voteProof);
    await vote_tx.wait();
  });

  /*
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
    const gv = await GaslessVoting_factory.deploy(signer.getAddress(), {value: parseEther('1')});
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
  */
});
