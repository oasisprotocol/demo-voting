import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type { EthereumUtils, EthereumUtilsInterface } from "../../../../@oasisprotocol/sapphire-contracts/contracts/EthereumUtils";
type EthereumUtilsConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class EthereumUtils__factory extends ContractFactory {
    constructor(...args: EthereumUtilsConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<EthereumUtils>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): EthereumUtils;
    connect(signer: Signer): EthereumUtils__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212204a0608d7bdc5040ddffbd702a496a3bf8f5e654fc0085ddabbb9b57c3936f2fb64736f6c63430008100033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "DER_Split_Error";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "expmod_Error";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "k256Decompress_Invalid_Length_Error";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "k256DeriveY_Invalid_Prefix_Error";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "recoverV_Error";
        readonly type: "error";
    }];
    static createInterface(): EthereumUtilsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): EthereumUtils;
}
export {};
