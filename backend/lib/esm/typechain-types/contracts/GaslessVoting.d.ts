import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
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
export type SignatureRSVStruct = {
    r: PromiseOrValue<BytesLike>;
    s: PromiseOrValue<BytesLike>;
    v: PromiseOrValue<BigNumberish>;
};
export type SignatureRSVStructOutput = [string, string, BigNumber] & {
    r: string;
    s: string;
    v: BigNumber;
};
export type VotingRequestStruct = {
    voter: PromiseOrValue<string>;
    proposalId: PromiseOrValue<BytesLike>;
    choiceId: PromiseOrValue<BigNumberish>;
};
export type VotingRequestStructOutput = [string, string, BigNumber] & {
    voter: string;
    proposalId: string;
    choiceId: BigNumber;
};
export interface GaslessVotingInterface extends utils.Interface {
    functions: {
        "CREATEPROPOSAL_TYPE()": FunctionFragment;
        "CREATEPROPOSAL_TYPEHASH()": FunctionFragment;
        "DAO()": FunctionFragment;
        "DOMAIN_SEPARATOR()": FunctionFragment;
        "EIP712_DOMAIN_TYPEHASH()": FunctionFragment;
        "VOTINGREQUEST_TYPE()": FunctionFragment;
        "VOTINGREQUEST_TYPEHASH()": FunctionFragment;
        "addKeypair()": FunctionFragment;
        "getChainId()": FunctionFragment;
        "listAddresses()": FunctionFragment;
        "makeProposalTransaction(uint256,address,(string,uint16,bool),(bytes32,bytes32,uint256))": FunctionFragment;
        "makeVoteTransaction(uint256,(address,bytes32,uint256),(bytes32,bytes32,uint256))": FunctionFragment;
        "proxy(bytes32,bytes)": FunctionFragment;
        "setDAO(address)": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "CREATEPROPOSAL_TYPE" | "CREATEPROPOSAL_TYPEHASH" | "DAO" | "DOMAIN_SEPARATOR" | "EIP712_DOMAIN_TYPEHASH" | "VOTINGREQUEST_TYPE" | "VOTINGREQUEST_TYPEHASH" | "addKeypair" | "getChainId" | "listAddresses" | "makeProposalTransaction" | "makeVoteTransaction" | "proxy" | "setDAO" | "supportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "CREATEPROPOSAL_TYPE", values?: undefined): string;
    encodeFunctionData(functionFragment: "CREATEPROPOSAL_TYPEHASH", values?: undefined): string;
    encodeFunctionData(functionFragment: "DAO", values?: undefined): string;
    encodeFunctionData(functionFragment: "DOMAIN_SEPARATOR", values?: undefined): string;
    encodeFunctionData(functionFragment: "EIP712_DOMAIN_TYPEHASH", values?: undefined): string;
    encodeFunctionData(functionFragment: "VOTINGREQUEST_TYPE", values?: undefined): string;
    encodeFunctionData(functionFragment: "VOTINGREQUEST_TYPEHASH", values?: undefined): string;
    encodeFunctionData(functionFragment: "addKeypair", values?: undefined): string;
    encodeFunctionData(functionFragment: "getChainId", values?: undefined): string;
    encodeFunctionData(functionFragment: "listAddresses", values?: undefined): string;
    encodeFunctionData(functionFragment: "makeProposalTransaction", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        ProposalParamsStruct,
        SignatureRSVStruct
    ]): string;
    encodeFunctionData(functionFragment: "makeVoteTransaction", values: [
        PromiseOrValue<BigNumberish>,
        VotingRequestStruct,
        SignatureRSVStruct
    ]): string;
    encodeFunctionData(functionFragment: "proxy", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "setDAO", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "CREATEPROPOSAL_TYPE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "CREATEPROPOSAL_TYPEHASH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "DAO", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "DOMAIN_SEPARATOR", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "EIP712_DOMAIN_TYPEHASH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "VOTINGREQUEST_TYPE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "VOTINGREQUEST_TYPEHASH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addKeypair", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getChainId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "listAddresses", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "makeProposalTransaction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "makeVoteTransaction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setDAO", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    events: {
        "KeypairCreated(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "KeypairCreated"): EventFragment;
}
export interface KeypairCreatedEventObject {
    addr: string;
}
export type KeypairCreatedEvent = TypedEvent<[
    string
], KeypairCreatedEventObject>;
export type KeypairCreatedEventFilter = TypedEventFilter<KeypairCreatedEvent>;
export interface GaslessVoting extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: GaslessVotingInterface;
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
        CREATEPROPOSAL_TYPE(overrides?: CallOverrides): Promise<[string]>;
        CREATEPROPOSAL_TYPEHASH(overrides?: CallOverrides): Promise<[string]>;
        DAO(overrides?: CallOverrides): Promise<[string]>;
        DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<[string]>;
        EIP712_DOMAIN_TYPEHASH(overrides?: CallOverrides): Promise<[string]>;
        VOTINGREQUEST_TYPE(overrides?: CallOverrides): Promise<[string]>;
        VOTINGREQUEST_TYPEHASH(overrides?: CallOverrides): Promise<[string]>;
        addKeypair(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getChainId(overrides?: CallOverrides): Promise<[BigNumber]>;
        listAddresses(overrides?: CallOverrides): Promise<[string[]]>;
        makeProposalTransaction(gasPrice: PromiseOrValue<BigNumberish>, creator: PromiseOrValue<string>, request: ProposalParamsStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<[string]>;
        makeVoteTransaction(gasPrice: PromiseOrValue<BigNumberish>, request: VotingRequestStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<[string] & {
            output: string;
        }>;
        proxy(ciphertextNonce: PromiseOrValue<BytesLike>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setDAO(in_dao: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
    };
    CREATEPROPOSAL_TYPE(overrides?: CallOverrides): Promise<string>;
    CREATEPROPOSAL_TYPEHASH(overrides?: CallOverrides): Promise<string>;
    DAO(overrides?: CallOverrides): Promise<string>;
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;
    EIP712_DOMAIN_TYPEHASH(overrides?: CallOverrides): Promise<string>;
    VOTINGREQUEST_TYPE(overrides?: CallOverrides): Promise<string>;
    VOTINGREQUEST_TYPEHASH(overrides?: CallOverrides): Promise<string>;
    addKeypair(overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getChainId(overrides?: CallOverrides): Promise<BigNumber>;
    listAddresses(overrides?: CallOverrides): Promise<string[]>;
    makeProposalTransaction(gasPrice: PromiseOrValue<BigNumberish>, creator: PromiseOrValue<string>, request: ProposalParamsStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<string>;
    makeVoteTransaction(gasPrice: PromiseOrValue<BigNumberish>, request: VotingRequestStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<string>;
    proxy(ciphertextNonce: PromiseOrValue<BytesLike>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setDAO(in_dao: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        CREATEPROPOSAL_TYPE(overrides?: CallOverrides): Promise<string>;
        CREATEPROPOSAL_TYPEHASH(overrides?: CallOverrides): Promise<string>;
        DAO(overrides?: CallOverrides): Promise<string>;
        DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;
        EIP712_DOMAIN_TYPEHASH(overrides?: CallOverrides): Promise<string>;
        VOTINGREQUEST_TYPE(overrides?: CallOverrides): Promise<string>;
        VOTINGREQUEST_TYPEHASH(overrides?: CallOverrides): Promise<string>;
        addKeypair(overrides?: CallOverrides): Promise<void>;
        getChainId(overrides?: CallOverrides): Promise<BigNumber>;
        listAddresses(overrides?: CallOverrides): Promise<string[]>;
        makeProposalTransaction(gasPrice: PromiseOrValue<BigNumberish>, creator: PromiseOrValue<string>, request: ProposalParamsStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<string>;
        makeVoteTransaction(gasPrice: PromiseOrValue<BigNumberish>, request: VotingRequestStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<string>;
        proxy(ciphertextNonce: PromiseOrValue<BytesLike>, data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        setDAO(in_dao: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "KeypairCreated(address)"(addr?: null): KeypairCreatedEventFilter;
        KeypairCreated(addr?: null): KeypairCreatedEventFilter;
    };
    estimateGas: {
        CREATEPROPOSAL_TYPE(overrides?: CallOverrides): Promise<BigNumber>;
        CREATEPROPOSAL_TYPEHASH(overrides?: CallOverrides): Promise<BigNumber>;
        DAO(overrides?: CallOverrides): Promise<BigNumber>;
        DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<BigNumber>;
        EIP712_DOMAIN_TYPEHASH(overrides?: CallOverrides): Promise<BigNumber>;
        VOTINGREQUEST_TYPE(overrides?: CallOverrides): Promise<BigNumber>;
        VOTINGREQUEST_TYPEHASH(overrides?: CallOverrides): Promise<BigNumber>;
        addKeypair(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getChainId(overrides?: CallOverrides): Promise<BigNumber>;
        listAddresses(overrides?: CallOverrides): Promise<BigNumber>;
        makeProposalTransaction(gasPrice: PromiseOrValue<BigNumberish>, creator: PromiseOrValue<string>, request: ProposalParamsStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<BigNumber>;
        makeVoteTransaction(gasPrice: PromiseOrValue<BigNumberish>, request: VotingRequestStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<BigNumber>;
        proxy(ciphertextNonce: PromiseOrValue<BytesLike>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setDAO(in_dao: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        CREATEPROPOSAL_TYPE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        CREATEPROPOSAL_TYPEHASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        DAO(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        EIP712_DOMAIN_TYPEHASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        VOTINGREQUEST_TYPE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        VOTINGREQUEST_TYPEHASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addKeypair(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getChainId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        listAddresses(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        makeProposalTransaction(gasPrice: PromiseOrValue<BigNumberish>, creator: PromiseOrValue<string>, request: ProposalParamsStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        makeVoteTransaction(gasPrice: PromiseOrValue<BigNumberish>, request: VotingRequestStruct, rsv: SignatureRSVStruct, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        proxy(ciphertextNonce: PromiseOrValue<BytesLike>, data: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setDAO(in_dao: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
