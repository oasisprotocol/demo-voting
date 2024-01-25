import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { AllowAllACLv1, AllowAllACLv1Interface } from "../../contracts/AllowAllACLv1";
type AllowAllACLv1ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AllowAllACLv1__factory extends ContractFactory {
    constructor(...args: AllowAllACLv1ConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<AllowAllACLv1>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): AllowAllACLv1;
    connect(signer: Signer): AllowAllACLv1__factory;
    static readonly bytecode = "0x608080604052346100165761011f908161001c8239f35b600080fdfe60806040526004361015601157600080fd5b6000803560e01c806356d15dc814608257806385e3f91914608a578063e53626671460825763ff6fef7d146045575b600080fd5b34607b576040366003190112607b576001600160a01b0360043581811603607e5760243590811603607b57602060405160018152f35b80fd5b5080fd5b5050604060cf565b5034607b57609636609e565b505050604051f35b60609060031901126040576001600160a01b0360043581811681036040579160243591604435908116810360405790565b503460405760db36609e565b505050602060405160018152f3fea2646970667358221220cf7e93e78aa4bc92124a192929c12c65bcf966963fa9955e19c9feea1a942ff064736f6c63430008100033";
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
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "canCreatePoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "canManagePoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly name: "canVoteOnPoll";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "pure";
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
    static createInterface(): AllowAllACLv1Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): AllowAllACLv1;
}
export {};
