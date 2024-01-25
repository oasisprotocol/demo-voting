/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  PollACLv1,
  PollACLv1Interface,
} from "../../../contracts/Types.sol/PollACLv1";

const _abi = [
  {
    inputs: [],
    name: "ACLManagementNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "PollCreationNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "PollManagementNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "VoteNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "canCreatePoll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "ProposalId",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "canManagePoll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "ProposalId",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "canVoteOnPoll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "ProposalId",
        name: "proposalId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "onPollCreated",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class PollACLv1__factory {
  static readonly abi = _abi;
  static createInterface(): PollACLv1Interface {
    return new utils.Interface(_abi) as PollACLv1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PollACLv1 {
    return new Contract(address, _abi, signerOrProvider) as PollACLv1;
  }
}
