import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { AcceptsProxyVotes, AcceptsProxyVotesInterface } from "../../../contracts/Types.sol/AcceptsProxyVotes";
export declare class AcceptsProxyVotes__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "string";
                readonly name: "ipfsHash";
                readonly type: "string";
            }, {
                readonly internalType: "uint16";
                readonly name: "numChoices";
                readonly type: "uint16";
            }, {
                readonly internalType: "bool";
                readonly name: "publishVotes";
                readonly type: "bool";
            }];
            readonly internalType: "struct ProposalParams";
            readonly name: "_params";
            readonly type: "tuple";
        }];
        readonly name: "createProposal";
        readonly outputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getACL";
        readonly outputs: readonly [{
            readonly internalType: "contract PollACLv1";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "voter";
            readonly type: "address";
        }, {
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "choiceIdBig";
            readonly type: "uint256";
        }];
        readonly name: "proxyVote";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): AcceptsProxyVotesInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): AcceptsProxyVotes;
}
