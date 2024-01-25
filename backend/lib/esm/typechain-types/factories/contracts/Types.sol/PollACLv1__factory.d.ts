import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { PollACLv1, PollACLv1Interface } from "../../../contracts/Types.sol/PollACLv1";
export declare class PollACLv1__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ACLManagementNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PollCreationNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PollManagementNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "VoteNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "dao";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }];
        readonly name: "canCreatePoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "dao";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }];
        readonly name: "canManagePoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "dao";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }];
        readonly name: "canVoteOnPoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "dao";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "creator";
            readonly type: "address";
        }];
        readonly name: "onPollCreated";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): PollACLv1Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): PollACLv1;
}
