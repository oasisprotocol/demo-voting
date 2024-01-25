import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface PollACLv1Interface extends utils.Interface {
    functions: {
        "canCreatePoll(address,address)": FunctionFragment;
        "canManagePoll(address,bytes32,address)": FunctionFragment;
        "canVoteOnPoll(address,bytes32,address)": FunctionFragment;
        "onPollCreated(address,bytes32,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "canCreatePoll" | "canManagePoll" | "canVoteOnPoll" | "onPollCreated"): FunctionFragment;
    encodeFunctionData(functionFragment: "canCreatePoll", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "canManagePoll", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "canVoteOnPoll", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "onPollCreated", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "canCreatePoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "canManagePoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "canVoteOnPoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onPollCreated", data: BytesLike): Result;
    events: {};
}
export interface PollACLv1 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: PollACLv1Interface;
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
        canCreatePoll(dao: PromiseOrValue<string>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        canVoteOnPoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    canCreatePoll(dao: PromiseOrValue<string>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    canVoteOnPoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        canCreatePoll(dao: PromiseOrValue<string>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        canVoteOnPoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        canCreatePoll(dao: PromiseOrValue<string>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        canVoteOnPoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        canCreatePoll(dao: PromiseOrValue<string>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        canVoteOnPoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
