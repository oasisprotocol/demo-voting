import { bytesToHex, hexToBytes } from '@ethereumjs/util';
import { Trie } from '@ethereumjs/trie';
import { BLOCK_HEADERS, STORAGE_PROOF_RESPONSE, decodeBlockHeaderRlp } from './common';
import { hexlify } from 'ethers';

describe('Proofs', function () {
  it('Decode Block Headers', async () => {
    for( let [k,v] of Object.entries(BLOCK_HEADERS) ) {
      // Lets make sure all the hard-coded block headers can decode
      const header = decodeBlockHeaderRlp(v);
      expect(header.number).toBeGreaterThan(0);
      expect(hexlify(header.hash())).toEqual(k);
    }
  });

  it('STORAGE_PROOF_RESPONSE to verify', async () => {
    // For each of the proofs which have storage proofs
    const storageProof = STORAGE_PROOF_RESPONSE.storageProof;
    const key = storageProof[0].key;
    const trie = new Trie({ root: hexToBytes(STORAGE_PROOF_RESPONSE.storageHash), useKeyHashing: true }); 

    await trie.fromProof(
      storageProof[0].proof.map((p) => hexToBytes(p))
    );

    let proof = await trie.createProof(hexToBytes(key));
    let value = await trie.verifyProof(hexToBytes(STORAGE_PROOF_RESPONSE.storageHash), hexToBytes(key), proof);

    expect(value).not.toBeNull();
    expect(storageProof[0].value).toEqual(bytesToHex(value!!));
  });
});
