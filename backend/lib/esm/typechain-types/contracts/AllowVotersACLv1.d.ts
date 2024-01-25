import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface AllowVotersACLv1Interface extends utils.Interface {
    functions: {
        "canCreatePoll(address,address)": FunctionFragment;
        "canManagePoll(address,bytes32,address)": FunctionFragment;
        "canVoteOnPoll(address,bytes32,address)": FunctionFragment;
        "onPollCreated(address,bytes32,address)": FunctionFragment;
        "setPollManagers(address,bytes32,address[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "canCreatePoll" | "canManagePoll" | "canVoteOnPoll" | "onPollCreated" | "setPollManagers"): FunctionFragment;
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
    encodeFunctionData(functionFragment: "setPollManagers", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<string>[]
    ]): string;
    decodeFunctionResult(functionFragment: "canCreatePoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "canManagePoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "canVoteOnPoll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onPollCreated", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPollManagers", data: BytesLike): Result;
    events: {};
}
export interface AllowVotersACLv1 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: AllowVotersACLv1Interface;
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
        canCreatePoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        canVoteOnPoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BytesLike>, arg2: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPollManagers(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, admins: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    canCreatePoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    canVoteOnPoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BytesLike>, arg2: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPollManagers(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, admins: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        canCreatePoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        canVoteOnPoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BytesLike>, arg2: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPollManagers(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, admins: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        canCreatePoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        canVoteOnPoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BytesLike>, arg2: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPollManagers(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, admins: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        canCreatePoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        canManagePoll(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        canVoteOnPoll(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BytesLike>, arg2: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        onPollCreated(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, creator: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPollManagers(dao: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, admins: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
