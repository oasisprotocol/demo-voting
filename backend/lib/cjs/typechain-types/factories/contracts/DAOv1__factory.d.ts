import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { DAOv1, DAOv1Interface } from "../../contracts/DAOv1";
type DAOv1ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DAOv1__factory extends ContractFactory {
    constructor(...args: DAOv1ConstructorParams);
    deploy(in_acl: PromiseOrValue<string>, in_proxyVoter: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<DAOv1>;
    getDeployTransaction(in_acl: PromiseOrValue<string>, in_proxyVoter: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): DAOv1;
    connect(signer: Signer): DAOv1__factory;
    static readonly bytecode = "0x60a0346200011d576001600160401b03601f62001c2638819003918201601f191684019183831185841017620000fe5780859260409485528339810103126200011d5781516001600160a01b0380821693909291908482036200011d5760200151938385168095036200011d576200011457506040519061013b9081830190811183821017620000fe57829162001aeb833903906000f08015620000f257165b608052600180546001600160a01b0319169190911790556040516119c8908162000123823960805181818161075201528181610a5e01528181610abe01528181610db301528181610e2901526115570152f35b6040513d6000823e3d90fd5b634e487b7160e01b600052604160045260246000fd5b9150506200009f565b600080fdfe608080604052600436101561001357600080fd5b60003560e01c90816301ffc9a714610ffa57508063078f872c14610de25780630873769514610d9d5780630879a53414610d545780630c24af8014610c895780632610c0f0146106d057806332ed5b121461066e5780634c051100146104315780635f98ac781461040057806375a12d72146103e0578063782fb5d4146102cd578063cb16128b1461027c578063d58f7399146101b6578063eb22efee1461018d5763f429273b146100c457600080fd5b34610188576100d236611065565b816100dd828261140e565b600554809111610177575b50506100f381611440565b9160005b828110610110576040518061010c86826110e1565b0390f35b80610126610121610172938561140e565b6112cb565b90549060031b1c8060005260206002815261015360406000206040519361014c856111b0565b84526114d4565b90820152610161828761150a565b5261016c818661150a565b50611389565b6100f7565b610181925061141b565b81386100e8565b600080fd5b34610188576000366003190112610188576001546040516001600160a01b039091168152602090f35b34610188576060366003190112610188576004356001600160a01b038082168203610188573315610243576001541633036101fe576101fc90604435906024359061151e565b005b60405162461bcd60e51b815260206004820152601e60248201527f43616e6e6f742063616c6c2070726f7879566f7465206469726563746c7900006044820152606490fd5b60405162461bcd60e51b81526020600482015260116024820152701516081b5d5cdd081899481cda59db9959607a1b6044820152606490fd5b34610188576020366003190112610188576004356005548110156101885760209060056000527f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db00154604051908152f35b3461018857602080600319360112610188576004356000526002815260406000206000825260ff60406000209154166103ce57604051610420810181811067ffffffffffffffff8211176103b85760409392935281815281810191610400368437600260009401935b8251811015610374578061034d61036f9287611398565b905460039190911b1c6001600160ff1b0316610369828661150a565b52611389565b610336565b50925090604051928392818401908285525180915260408401929160005b8281106103a157505050500390f35b835185528695509381019392810192600101610392565b634e487b7160e01b600052604160045260246000fd5b60405163785bbc6d60e11b8152600490fd5b34610188576040366003190112610188576101fc6024356004353361151e565b34610188576020366003190112610188576004356000526002602052602060ff604060002054166040519015158152f35b34610188576020806003193601126101885760043580600052600282526040600020906000835260406000209260ff9283600282015460101c161561065c575483166103ce578383600180920180549361048a85611428565b61049760405191826111e8565b8581526104a386611428565b8183019790601f190136893760005b87811061057d57505060405195828782815201908194600052836000209060005b81811061056157505050866104e99103876111e8565b604051956040870190604088525180915260608701939060005b81811061054557505050858303868301525180835291810195926000905b83821061052e5786880387f35b845181168852968201969382019390850190610521565b82516001600160a01b0316865294840194918401918701610503565b82546001600160a01b03168452928501929188019188016104d3565b61058d81869795969a989a611339565b919054916040519263021e694d60e21b845284600485015260018060a01b039160031b1c166024830152604082604481305afa8015610650578686916000906105ef575b6105e39450015116610369828661150a565b979597949392946104b2565b5050506040823d604011610648575b8161060b604093836111e8565b81010312610188578560405192610621846111b0565b61062a81611360565b845201519185831683036101885786816105e39482899401526105d1565b3d91506105fe565b6040513d6000823e3d90fd5b6040516388310bad60e01b8152600490fd5b34610188576020366003190112610188576004356000526002602052604060002060ff81541660ff60036106a46001850161120a565b930154166106c66040519384931515845260606020850152606084019061107b565b9060408301520390f35b3461018857600319602036820112610188576004359067ffffffffffffffff8211610188576060823603918201126101885761ffff61071160248401611351565b1615610c7757602061ffff61072860248501611351565b1611610c655760405160016290108360e01b031981523060048201523360248201526020816044817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561065057600091610c2b575b5015610c1957604051602081019033825260408082015283600401359260221901831215610188578383016024600482013591019067ffffffffffffffff811161018857803603821361018857828160e092610838946060808501528160c085015284840137600083828401015261ffff61080860248a0161136d565b16608083015261081a6044890161137c565b151560a0830152601f801991011681010360c08101845201826111e8565b5190209081600052600260205260ff60406000205416610c075760405161085e816111cc565b600181526040519161086f836111cc565b67ffffffffffffffff8111610188573660238287010112156101885767ffffffffffffffff60048287010135116103b857604051906108be86820160040135601f01601f1916602001836111e8565b858101600481013580845236910160240111610188576020600482816000948a0101356024828b010184870137880101358301015282526109016024850161136d565b60208301526109126044850161137c565b604083015260208101918252600060408201528260005260026020526040600020918151151560ff8019855416911617835551805180519067ffffffffffffffff82116103b85781906109686001870154611176565b601f8111610bb4575b50602090601f8311600114610b4457600092610b39575b50508160011b916000199060031b1c19161760018401559392935b600283019061ffff60208201511662ff000060408454930151151560101b169162ffffff19161717905560ff604060038094019201511660ff198254161790556109ec836113a8565b50826000526000602052604060002092600260009401935b61ffff610a1360248601611351565b16811015610a5b57610a136024610a5283610a3161ffff958a611398565b8154600019918a1b91821b8019909116600160ff1b90921b16179055611389565b92505050610a04565b507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163b15610188576040516385e3f91960e01b81523060048201526024810182905233604482015290600082606481836001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1801561065057610b1f575b6020907f288a29bca04edb18fcdb2c76d6e3b03b8a137c85c70d1a4cb8aacfa868d6051082604051838152a1604051908152f35b67ffffffffffffffff82116103b857602091604052610aeb565b015190508780610988565b600187016000908152602081209350601f198516905b818110610b9c5750908460019594939210610b83575b505050811b0160018401559392936109a3565b015160001960f88460031b161c19169055878080610b70565b92936020600181928786015181550195019301610b5a565b909150600186016000526020600020601f840160051c810160208510610c00575b90849392915b601f830160051c82018110610bf1575050610971565b60008155859450600101610bdb565b5080610bd5565b60405163119b4fd360e11b8152600490fd5b60405163732550d560e01b8152600490fd5b90506020813d602011610c5d575b81610c46602093836111e8565b8101031261018857610c5790611360565b8361078b565b3d9150610c39565b604051635efec3bf60e01b8152600490fd5b604051630db2f02f60e01b8152600490fd5b3461018857610c9736611065565b90610ca2828261140e565b91600354809311610d44575b610cb781611440565b9160005b828110610cd0576040518061010c86826110e1565b610cda818361140e565b9085821015610d2e57610d29917fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b01548060005260206002815261015360406000206040519361014c856111b0565b610cbb565b634e487b7160e01b600052603260045260246000fd5b50610d4f818361141b565b610cae565b34610188576040366003190112610188576024356001600160a01b038116810361018857610d866040916004356118ef565b60ff60208351928051151584520151166020820152f35b34610188576000366003190112610188576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101885760208060031936011261018857604051630ada2bb960e31b81523060048083019190915235602482018190523360448301529082816064816001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000165afa90811561065057600091610fc5575b5015610fb3578060005260028252604060002060ff918282541615610fa15780600094929452600082526040600020600091600092600261ffff816000990154169301965b86811684811015610f0657908791610eb7828b611398565b905460039190911b1c6001600160ff1b031690878211610efa575b505016868114610ee457600101610e9f565b634e487b7160e01b600052601160045260246000fd5b90965092508980610ed2565b50506000828152600286526040902060038101805460ff19908116848a1617909155815416905584610f3783611806565b5060055491600160401b8310156103b85783610f96610f7d8560017f32c34fd89f87a7cc9f257c5f4c2ed207f4776f12b94e6aec10d90ce489d6c52897016005556112cb565b819391549060031b600019811b9283911b169119161790565b9055604051908152a2005b604051634065aaf160e11b8152600490fd5b604051637f3fbb5f60e11b8152600490fd5b90508281813d8311610ff3575b610fdc81836111e8565b8101031261018857610fed90611360565b83610e5a565b503d610fd2565b34610188576020366003190112610188576004359063ffffffff60e01b8216809203610188576020916301ffc9a760e01b8114908115611054575b8115611043575b5015158152f35b63d58f739960e01b1490508361103c565b633ad096b960e11b81149150611035565b6040906003190112610188576004359060243590565b91908251926060825283519081606084015260005b8281106110cb57506080939450604090600085848601015261ffff6020820151166020850152015115156040830152601f8019910116010190565b8060208092880101516080828701015201611090565b602080820190808352835180925260409283810182858560051b8401019601946000925b858410611116575050505050505090565b909192939495968580600192603f19858203018752818b518051835201519086838201528151151587820152608060ff8861115e8686015160608087015260a086019061107b565b94015116910152990194019401929594939190611105565b90600182811c921680156111a6575b602083101461119057565b634e487b7160e01b600052602260045260246000fd5b91607f1691611185565b6040810190811067ffffffffffffffff8211176103b857604052565b6060810190811067ffffffffffffffff8211176103b857604052565b90601f8019910116810190811067ffffffffffffffff8211176103b857604052565b90604051611217816111cc565b80926040519060009181549261122c84611176565b8083526001948086169081156112a95750600114611272575b5091816112596040959360ff9503826111e8565b8552015461ffff8116602085015260101c161515910152565b90508260005260209081600020906000915b81831061129657505082010181611245565b8054858401850152918301918601611284565b60ff191660208086019190915291151560051b84019091019150829050611245565b600554811015610d2e5760056000527f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db00190600090565b600354811015610d2e5760036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b0190600090565b8054821015610d2e5760005260206000200190600090565b3561ffff811681036101885790565b5190811515820361018857565b359061ffff8216820361018857565b3590811515820361018857565b6000198114610ee45760010190565b6020821015610d2e570190600090565b60008181526004602052604081205461140957600354600160401b8110156113f55790826113e1610f7d84600160409601600355611302565b905560035492815260046020522055600190565b634e487b7160e01b82526041600452602482fd5b905090565b91908201809211610ee457565b91908203918211610ee457565b67ffffffffffffffff81116103b85760051b60200190565b9061144a82611428565b604090611459825191826111e8565b838152809361146a601f1991611428565b019160005b83811061147c5750505050565b602090825161148a816111b0565b600081528351611499816111cc565b600081528451906114a9826111cc565b606082528491600083820152600087820152828201526000868201528183015282860101520161146f565b906040516114e1816111cc565b604060ff6003839582815416151585526114fd6001820161120a565b6020860152015416910152565b8051821015610d2e5760209160051b010190565b60405163e536266760e01b8152306004820152602481018390526001600160a01b038216604482015292939092602081806064810103817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610650576000916117c9575b50156117b757816000526002602052604060002060ff928382541615610fa15760005260006020526040600020918386169561ffff95866002850154168810156117a55760018060a01b0381166000528460205260406000209386604051956115f8876111b0565b548181161515875260081c16602086015260005b88600283015416811015611701578061165561162e6116e39360028b01611398565b8192915490600160ff1b828260031b1c18919060031b600019811b9283911b169119161790565b90556000818c036116fc575060015b61169f6116748360028c01611398565b6116898d839593549316838360031b1c61140e565b919060031b600019811b9283911b169119161790565b905586511515806116ed575b600090156116e8575060015b6116dc6116c78360028c01611398565b6116898d839593549316838360031b1c61141b565b9055611389565b61160c565b6116b7565b508089602089015116146116ab565b611664565b509094959297506002919650015460101c16908161179b575b50611754575b6001600160a01b0316600090815260209190915260409020805461ffff191660089290921b61ff0016919091176001179055565b600182018054600160401b8110156103b85761177591600182018155611339565b81546001600160a01b0360039290921b82811b8019909216928516901b16179055611720565b905051153861171a565b6040516355f00bbb60e11b8152600490fd5b60405163bbb2b45560e01b8152600490fd5b906020823d6020116117fe575b816117e3602093836111e8565b810103126117fb57506117f590611360565b38611590565b80fd5b3d91506117d6565b6000908082526004908160205260408320548015156000146118e957600019908082018181116118d657600354908382019182116118c357808203611890575b505050600354801561187d5781019061185e82611302565b909182549160031b1b1916905560035582526020526040812055600190565b634e487b7160e01b855260318452602485fd5b6118ae61189f610f7d93611302565b90549060031b1c928392611302565b90558552836020526040852055388080611846565b634e487b7160e01b875260118652602487fd5b634e487b7160e01b865260118552602486fd5b50505090565b906040918251916118ff836111b0565b6000808452602093840181905291825260028352838220828452848320916001600160a01b0316908533831461197957506002015460101c60ff1615611968578252825282902091519160ff90611955846111b0565b548181161515845260081c169082015290565b84516388310bad60e01b8152600490fd5b3385529285525050902091519160ff90611955846111b056fea2646970667358221220bec1f45c77fc945e5bbcf8ac2468477de6663a6dc1a646d58cc88b05a457ad4d64736f6c63430008100033608080604052346100165761011f908161001c8239f35b600080fdfe60806040526004361015601157600080fd5b6000803560e01c806356d15dc814608257806385e3f91914608a578063e53626671460825763ff6fef7d146045575b600080fd5b34607b576040366003190112607b576001600160a01b0360043581811603607e5760243590811603607b57602060405160018152f35b80fd5b5080fd5b5050604060cf565b5034607b57609636609e565b505050604051f35b60609060031901126040576001600160a01b0360043581811681036040579160243591604435908116810360405790565b503460405760db36609e565b505050602060405160018152f3fea2646970667358221220cf7e93e78aa4bc92124a192929c12c65bcf966963fa9955e19c9feea1a942ff064736f6c63430008100033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract PollACLv1";
            readonly name: "in_acl";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "in_proxyVoter";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "AlreadyExists";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "AlreadyVoted";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NoChoices";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotActive";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotPublishingVotes";
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
        readonly name: "StillActive";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TooManyChoices";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "UnknownChoice";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "VoteNotAllowed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "ProposalId";
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "topChoice";
            readonly type: "uint256";
        }];
        readonly name: "ProposalClosed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "ProposalId";
            readonly name: "id";
            readonly type: "bytes32";
        }];
        readonly name: "ProposalCreated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "id";
            readonly type: "bytes32";
        }];
        readonly name: "ballotIsActive";
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
        }, {
            readonly internalType: "uint256";
            readonly name: "choiceIdBig";
            readonly type: "uint256";
        }];
        readonly name: "castVote";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }];
        readonly name: "closeProposal";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
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
            readonly internalType: "uint256";
            readonly name: "_offset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_count";
            readonly type: "uint256";
        }];
        readonly name: "getActiveProposals";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "ProposalId";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "active";
                    readonly type: "bool";
                }, {
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
                    readonly name: "params";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "topChoice";
                    readonly type: "uint8";
                }];
                readonly internalType: "struct DAOv1.Proposal";
                readonly name: "proposal";
                readonly type: "tuple";
            }];
            readonly internalType: "struct DAOv1.ProposalWithId[]";
            readonly name: "_proposals";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_offset";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_count";
            readonly type: "uint256";
        }];
        readonly name: "getPastProposals";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "ProposalId";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "active";
                    readonly type: "bool";
                }, {
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
                    readonly name: "params";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "uint8";
                    readonly name: "topChoice";
                    readonly type: "uint8";
                }];
                readonly internalType: "struct DAOv1.Proposal";
                readonly name: "proposal";
                readonly type: "tuple";
            }];
            readonly internalType: "struct DAOv1.ProposalWithId[]";
            readonly name: "_proposals";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }];
        readonly name: "getVoteCounts";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "voter";
            readonly type: "address";
        }];
        readonly name: "getVoteOf";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bool";
                readonly name: "exists";
                readonly type: "bool";
            }, {
                readonly internalType: "uint8";
                readonly name: "choice";
                readonly type: "uint8";
            }];
            readonly internalType: "struct DAOv1.Choice";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "proposalId";
            readonly type: "bytes32";
        }];
        readonly name: "getVotes";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint8[]";
            readonly name: "";
            readonly type: "uint8[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly name: "pastProposals";
        readonly outputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "ProposalId";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly name: "proposals";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "active";
            readonly type: "bool";
        }, {
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
            readonly name: "params";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint8";
            readonly name: "topChoice";
            readonly type: "uint8";
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
    }, {
        readonly inputs: readonly [];
        readonly name: "proxyVoter";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "interfaceID";
            readonly type: "bytes4";
        }];
        readonly name: "supportsInterface";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): DAOv1Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): DAOv1;
}
export {};
