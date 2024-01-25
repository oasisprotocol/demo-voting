import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { WhitelistVotersACLv1, WhitelistVotersACLv1Interface } from "../../contracts/WhitelistVotersACLv1";
type WhitelistVotersACLv1ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class WhitelistVotersACLv1__factory extends ContractFactory {
    constructor(...args: WhitelistVotersACLv1ConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<WhitelistVotersACLv1>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): WhitelistVotersACLv1;
    connect(signer: Signer): WhitelistVotersACLv1__factory;
    static readonly bytecode = "0x6080806040523461002857600480546001600160a01b031916331790556105bb908161002e8239f35b600080fdfe6080604081815260048036101561001557600080fd5b600092833560e01c90816336e256d114610327575080634923d5181461028557806356d15dc81461026057806385e3f919146101df578063bf1c847814610128578063e5362667146100af5763ff6fef7d1461007057600080fd5b346100ab57816003193601126100ab576001600160a01b039035818116036100ab57602435908116036100a7576020905160018152f35b5080fd5b8280fd5b5050346100a757600160ff826020946100f56101036100cd36610460565b86516001600160a01b039093168b840190815260208101929092529390929082906040850190565b03601f198101835282610494565b51902082526002875282822090858060a01b0316825286522054161515149051908152f35b509190346100a757610139366103f6565b956101489391933384846104cc565b156101d1575083516001600160a01b03909116602080830191825260408301939093529061017981606081016100f5565b51902084526002815282842090845b86811061019457858551f35b6101cc906001600160a01b036101b36101ae838b8961054b565b610571565b168752838352858720805460ff19166001179055610526565b610188565b8451637f3fbb5f60e11b8152fd5b50346100ab576101ee36610460565b926001600160a01b039291908383163303610252575084516001600160a01b039092166020830190815260408301919091529061022e81606081016100f5565b51902084528360205282842091168352602052808220600160ff1982541617905551f35b8551630e23de2960e21b8152fd5b5050346100a75760209061027c61027636610460565b916104cc565b90519015158152f35b509190346100a757610296366103f6565b8654909691936001600160a01b039392909184163303610252575084516001600160a01b0390911660208083019182526040830193909352906102dc81606081016100f5565b519020855284815283852091855b8781106102f657868651f35b80826103096101ae610322948c8a61054b565b168852848452868820805460ff19166001179055610526565b6102ea565b91849150346100a757602092836003193601126100ab57308482019081529135602083015292939261035c81604084016100f5565b519020815260038352818120908251808584549182815201908194845286842090845b8181106103d95750505081610395910382610494565b83519485948186019282875251809352850193925b8281106103b957505050500390f35b83516001600160a01b0316855286955093810193928101926001016103aa565b82546001600160a01b03168452928801926001928301920161037f565b90606060031983011261045b576004356001600160a01b038116810361045b57916024359160443567ffffffffffffffff9283821161045b578060238301121561045b57816004013593841161045b5760248460051b8301011161045b576024019190565b600080fd5b606090600319011261045b576001600160a01b03600435818116810361045b579160243591604435908116810361045b5790565b90601f8019910116810190811067ffffffffffffffff8211176104b657604052565b634e487b7160e01b600052604160045260246000fd5b604080516001600160a01b0390921660208301908152908201929092526104f681606081016100f5565b519020600052600060205260406000209060018060a01b0316600052602052600160ff6040600020541615151490565b60001981146105355760010190565b634e487b7160e01b600052601160045260246000fd5b919081101561055b5760051b0190565b634e487b7160e01b600052603260045260246000fd5b356001600160a01b038116810361045b579056fea2646970667358221220159e359618a14a245f01fc4179d7825e2b80a5bf22d0b50d7c115a36804a063f64736f6c63430008100033";
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
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }];
        readonly name: "listEligibleVoters";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "";
            readonly type: "address[]";
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
            readonly name: "voters";
            readonly type: "address[]";
        }];
        readonly name: "setEligibleVoters";
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
    static createInterface(): WhitelistVotersACLv1Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): WhitelistVotersACLv1;
}
export {};
