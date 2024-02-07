import { Account } from '@ethereumjs/util';
import { Trie } from '@ethereumjs/trie';
import { BLOCK_HEADERS, PROOFS, decodeBlockHeaderRlp } from './common';
import { decodeRlp, zeroPadValue, encodeRlp, getBytes, hexlify } from 'ethers';

describe('Proofs', function () {
  it('Decode Block Headers', async () => {
    for( let [k,v] of Object.entries(BLOCK_HEADERS) ) {
      // Lets make sure all the hard-coded block headers can decode
      const header = decodeBlockHeaderRlp(v);
      expect(header.number).toBeGreaterThan(0);
      expect(hexlify(header.hash())).toEqual(k);
    }
  });

  // it('Example Proofs Verify', async () => {
  //   for( const x of PROOFS ) {
  //     const account = Account.fromAccountData(x.proof);
  //     const block = decodeBlockHeaderRlp(BLOCK_HEADERS[x.blockHash]);

  //     const accountProofNodesRlp = encodeRlp(x.proof.accountProof.map(decodeRlp));

  //     const t = new Trie();

  //     const result = await t.verifyProof(block.stateRoot, account.serialize(), x.proof.accountProof.map((_) => getBytes(_)))
  //   }
  // });

  it('StorageProof', async () => {
    // For each of the proofs which have storage proofs
    for( const x of PROOFS ) {
      if( 0 == x.proof.storageProof.length ) {
        continue;
      }

      // Verify the proofs
      for( const i in x.proof.storageProof ) {
        const slot = x.slots[i];
        const storageProof = x.proof.storageProof[i];
        const storageProofNodesRlp = encodeRlp(storageProof.proof.map(decodeRlp));

        const r = await sp.verifyStorage(
            x.blockHash,
            x.proof.address,
            slot.slot,
            zeroPadValue(slot.key, 32),
            storageProofNodesRlp);

        expect(r).equals(zeroPadValue(storageProof.value, 32))
      }
    }
  });
});
