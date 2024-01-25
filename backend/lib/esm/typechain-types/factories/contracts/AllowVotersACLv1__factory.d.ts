import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { AllowVotersACLv1, AllowVotersACLv1Interface } from "../../contracts/AllowVotersACLv1";
type AllowVotersACLv1ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AllowVotersACLv1__factory extends ContractFactory {
    constructor(...args: AllowVotersACLv1ConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<AllowVotersACLv1>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): AllowVotersACLv1;
    connect(signer: Signer): AllowVotersACLv1__factory;
    static readonly bytecode = "0x6080806040523461002857600480546001600160a01b03191633179055610380908161002e8239f35b600080fdfe608060408181526004918236101561001657600080fd5b600092833560e01c9182634923d518146101ab5750816356d15dc81461014157816385e3f919146100b157508063e5362667146100955763ff6fef7d1461005c57600080fd5b346100915780600319360112610091576100746102c3565b506024356001600160a01b03811603610091576020905160018152f35b5080fd5b5034610091576020906100a7366102de565b5050505160018152f35b90503461013d576100c1366102de565b926001600160a01b03929190838316330361012f575084516001600160a01b039092166020830190815260408301919091529061010b81606081015b03601f198101835282610312565b51902084528360205282842091168352602052808220600160ff1982541617905551f35b8551630e23de2960e21b8152fd5b8280fd5b50503461009157600160ff826020946100fd61018761015f366102de565b86516001600160a01b039093168b840190815260208101929092529390929082906040850190565b519020825281875282822090858060a01b0316825286522054161515149051908152f35b9150346102bf5760603660031901126102bf576101c66102c3565b9060443567ffffffffffffffff928382116102bb57366023830112156102bb57818301359384116102bb57602494600592368787861b830101116102b75784546001600160a01b039290831633036102a9575087516001600160a01b039093166020808501918252883560408601529361024381606081016100fd565b519020895288835287892093895b87811061025d578a8a51f35b8881831b840101358481168091036102a5578b52858552898b20805460ff19166001179055600019811461029357600101610251565b634e487b7160e01b8b5260118752888bfd5b8b80fd5b630e23de2960e21b81528590fd5b8880fd5b8680fd5b8380fd5b600435906001600160a01b03821682036102d957565b600080fd5b60609060031901126102d9576001600160a01b0360043581811681036102d957916024359160443590811681036102d95790565b90601f8019910116810190811067ffffffffffffffff82111761033457604052565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220dabfbc11e67d5fb47664b48cef28c4eb7f0cc62be026cdeae6c3312cd50979ce64736f6c63430008100033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
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
            readonly internalType: "address[]";
            readonly name: "admins";
            readonly type: "address[]";
        }];
        readonly name: "setPollManagers";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): AllowVotersACLv1Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): AllowVotersACLv1;
}
export {};
