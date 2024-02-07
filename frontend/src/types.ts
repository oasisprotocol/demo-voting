export type Poll = {
    creator: string;
    name: string;
    description: string;
    choices: string[];
    options: {
      publishVotes: boolean;
      closeTimestamp: number;
    };
};

export type StorageProof = {
  key: string,
  value: string,
  proof: string[],
};

export type GetProofResponse = {
  balance: string,
  codeHash: string,
  nonce: string,
  storageHash: string,
  accountProof: string[],
  storageProof: StorageProof[],
};
