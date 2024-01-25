import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type ProposalParamsStruct = {
    ipfsHash: PromiseOrValue<string>;
    numChoices: PromiseOrValue<BigNumberish>;
    publishVotes: PromiseOrValue<boolean>;
};
export type ProposalParamsStructOutput = [string, number, boolean] & {
    ipfsHash: string;
    numChoices: number;
    publishVotes: boolean;
};
export interface AcceptsProxyVotesInterface extends utils.Interface {
    functions: {
        "createProposal((string,uint16,bool))": FunctionFragment;
        "getACL()": FunctionFragment;
        "proxyVote(address,bytes32,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "createProposal" | "getACL" | "proxyVote"): FunctionFragment;
    encodeFunctionData(functionFragment: "createProposal", values: [ProposalParamsStruct]): string;
    encodeFunctionData(functionFragment: "getACL", values?: undefined): string;
    encodeFunctionData(functionFragment: "proxyVote", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "createProposal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getACL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxyVote", data: BytesLike): Result;
    events: {};
}
export interface AcceptsProxyVotes extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AcceptsProxyVotesInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getACL(overrides?: CallOverrides): Promise<[string]>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getACL(overrides?: CallOverrides): Promise<string>;
    proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        createProposal(_params: ProposalParamsStruct, overrides?: CallOverrides): Promise<string>;
        getACL(overrides?: CallOverrides): Promise<string>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getACL(overrides?: CallOverrides): Promise<BigNumber>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getACL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
