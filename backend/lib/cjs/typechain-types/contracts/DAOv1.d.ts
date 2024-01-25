import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
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
export declare namespace DAOv1 {
    type ProposalStruct = {
        active: PromiseOrValue<boolean>;
        params: ProposalParamsStruct;
        topChoice: PromiseOrValue<BigNumberish>;
    };
    type ProposalStructOutput = [
        boolean,
        ProposalParamsStructOutput,
        number
    ] & {
        active: boolean;
        params: ProposalParamsStructOutput;
        topChoice: number;
    };
    type ProposalWithIdStruct = {
        id: PromiseOrValue<BytesLike>;
        proposal: DAOv1.ProposalStruct;
    };
    type ProposalWithIdStructOutput = [
        string,
        DAOv1.ProposalStructOutput
    ] & {
        id: string;
        proposal: DAOv1.ProposalStructOutput;
    };
    type ChoiceStruct = {
        exists: PromiseOrValue<boolean>;
        choice: PromiseOrValue<BigNumberish>;
    };
    type ChoiceStructOutput = [boolean, number] & {
        exists: boolean;
        choice: number;
    };
}
export interface DAOv1Interface extends utils.Interface {
    functions: {
        "ballotIsActive(bytes32)": FunctionFragment;
        "castVote(bytes32,uint256)": FunctionFragment;
        "closeProposal(bytes32)": FunctionFragment;
        "createProposal((string,uint16,bool))": FunctionFragment;
        "getACL()": FunctionFragment;
        "getActiveProposals(uint256,uint256)": FunctionFragment;
        "getPastProposals(uint256,uint256)": FunctionFragment;
        "getVoteCounts(bytes32)": FunctionFragment;
        "getVoteOf(bytes32,address)": FunctionFragment;
        "getVotes(bytes32)": FunctionFragment;
        "pastProposals(uint256)": FunctionFragment;
        "proposals(bytes32)": FunctionFragment;
        "proxyVote(address,bytes32,uint256)": FunctionFragment;
        "proxyVoter()": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "ballotIsActive" | "castVote" | "closeProposal" | "createProposal" | "getACL" | "getActiveProposals" | "getPastProposals" | "getVoteCounts" | "getVoteOf" | "getVotes" | "pastProposals" | "proposals" | "proxyVote" | "proxyVoter" | "supportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "ballotIsActive", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "castVote", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "closeProposal", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "createProposal", values: [ProposalParamsStruct]): string;
    encodeFunctionData(functionFragment: "getACL", values?: undefined): string;
    encodeFunctionData(functionFragment: "getActiveProposals", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getPastProposals", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getVoteCounts", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "getVoteOf", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getVotes", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "pastProposals", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "proposals", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "proxyVote", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "proxyVoter", values?: undefined): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "ballotIsActive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "castVote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "closeProposal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createProposal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getACL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getActiveProposals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPastProposals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVoteCounts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVoteOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVotes", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pastProposals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxyVote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "proxyVoter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    events: {
        "ProposalClosed(bytes32,uint256)": EventFragment;
        "ProposalCreated(bytes32)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ProposalClosed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
}
export interface ProposalClosedEventObject {
    id: string;
    topChoice: BigNumber;
}
export type ProposalClosedEvent = TypedEvent<[
    string,
    BigNumber
], ProposalClosedEventObject>;
export type ProposalClosedEventFilter = TypedEventFilter<ProposalClosedEvent>;
export interface ProposalCreatedEventObject {
    id: string;
}
export type ProposalCreatedEvent = TypedEvent<[
    string
], ProposalCreatedEventObject>;
export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;
export interface DAOv1 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: DAOv1Interface;
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
        ballotIsActive(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
        castVote(proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        closeProposal(proposalId: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getACL(overrides?: CallOverrides): Promise<[string]>;
        getActiveProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            DAOv1.ProposalWithIdStructOutput[]
        ] & {
            _proposals: DAOv1.ProposalWithIdStructOutput[];
        }>;
        getPastProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            DAOv1.ProposalWithIdStructOutput[]
        ] & {
            _proposals: DAOv1.ProposalWithIdStructOutput[];
        }>;
        getVoteCounts(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[BigNumber[]]>;
        getVoteOf(proposalId: PromiseOrValue<BytesLike>, voter: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[DAOv1.ChoiceStructOutput]>;
        getVotes(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string[], number[]]>;
        pastProposals(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        proposals(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            ProposalParamsStructOutput,
            number
        ] & {
            active: boolean;
            params: ProposalParamsStructOutput;
            topChoice: number;
        }>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        proxyVoter(overrides?: CallOverrides): Promise<[string]>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
    };
    ballotIsActive(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    castVote(proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    closeProposal(proposalId: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getACL(overrides?: CallOverrides): Promise<string>;
    getActiveProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<DAOv1.ProposalWithIdStructOutput[]>;
    getPastProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<DAOv1.ProposalWithIdStructOutput[]>;
    getVoteCounts(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber[]>;
    getVoteOf(proposalId: PromiseOrValue<BytesLike>, voter: PromiseOrValue<string>, overrides?: CallOverrides): Promise<DAOv1.ChoiceStructOutput>;
    getVotes(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string[], number[]]>;
    pastProposals(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    proposals(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
        boolean,
        ProposalParamsStructOutput,
        number
    ] & {
        active: boolean;
        params: ProposalParamsStructOutput;
        topChoice: number;
    }>;
    proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    proxyVoter(overrides?: CallOverrides): Promise<string>;
    supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        ballotIsActive(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        castVote(proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        closeProposal(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        createProposal(_params: ProposalParamsStruct, overrides?: CallOverrides): Promise<string>;
        getACL(overrides?: CallOverrides): Promise<string>;
        getActiveProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<DAOv1.ProposalWithIdStructOutput[]>;
        getPastProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<DAOv1.ProposalWithIdStructOutput[]>;
        getVoteCounts(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber[]>;
        getVoteOf(proposalId: PromiseOrValue<BytesLike>, voter: PromiseOrValue<string>, overrides?: CallOverrides): Promise<DAOv1.ChoiceStructOutput>;
        getVotes(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string[], number[]]>;
        pastProposals(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        proposals(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[
            boolean,
            ProposalParamsStructOutput,
            number
        ] & {
            active: boolean;
            params: ProposalParamsStructOutput;
            topChoice: number;
        }>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        proxyVoter(overrides?: CallOverrides): Promise<string>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "ProposalClosed(bytes32,uint256)"(id?: PromiseOrValue<BytesLike> | null, topChoice?: null): ProposalClosedEventFilter;
        ProposalClosed(id?: PromiseOrValue<BytesLike> | null, topChoice?: null): ProposalClosedEventFilter;
        "ProposalCreated(bytes32)"(id?: null): ProposalCreatedEventFilter;
        ProposalCreated(id?: null): ProposalCreatedEventFilter;
    };
    estimateGas: {
        ballotIsActive(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        castVote(proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        closeProposal(proposalId: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getACL(overrides?: CallOverrides): Promise<BigNumber>;
        getActiveProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getPastProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getVoteCounts(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        getVoteOf(proposalId: PromiseOrValue<BytesLike>, voter: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getVotes(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        pastProposals(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        proposals(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        proxyVoter(overrides?: CallOverrides): Promise<BigNumber>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        ballotIsActive(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        castVote(proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        closeProposal(proposalId: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        createProposal(_params: ProposalParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getACL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getActiveProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPastProposals(_offset: PromiseOrValue<BigNumberish>, _count: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVoteCounts(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVoteOf(proposalId: PromiseOrValue<BytesLike>, voter: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVotes(proposalId: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pastProposals(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        proposals(arg0: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        proxyVote(voter: PromiseOrValue<string>, proposalId: PromiseOrValue<BytesLike>, choiceIdBig: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        proxyVoter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
