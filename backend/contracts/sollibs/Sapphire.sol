// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.8;

/**
 * @title Sapphire
 * @dev Convenient wrapper methods for Sapphire's cryptographic primitives.
 */
library Sapphire {
    address private constant RANDOM_BYTES =
        0x0100000000000000000000000000000000000001;
    address private constant DERIVE_KEY =
        0x0100000000000000000000000000000000000002;
    address private constant ENCRYPT =
        0x0100000000000000000000000000000000000003;
    address private constant DECRYPT =
        0x0100000000000000000000000000000000000004;
    address private constant GENERAGE_SIGNING_KEYPAIR =
        0x0100000000000000000000000000000000000005;
    address private constant SIGN_DIGEST =
        0x0100000000000000000000000000000000000006;
    address private constant VERIFY_DIGEST =
        0x0100000000000000000000000000000000000007;
    address private constant CURVE25519_PUBLIC_KEY =
        0x0100000000000000000000000000000000000008;

    type Curve25519PublicKey is bytes32;
    type Curve25519SecretKey is bytes32;

    enum SigningAlg {
        // Ed25519 signature over the provided message using SHA-512/265 with a domain separator.
        // Can be used to sign transactions for the Oasis consensus layer and SDK paratimes.
        Ed25519Oasis,
        // Ed25519 signature over the provided message.
        Ed25519Pure,
        // Ed25519 signature over the provided prehashed SHA-512 digest.
        Ed25519PrehashedSha512,
        // Secp256k1 signature over the provided message using SHA-512/256 with a domain separator.
        // Can be used to sign transactions for the Oasis consensus layer and SDK paratimes.
        Secp256k1Oasis,
        // Secp256k1 over the provided Keccak256 digest.
        // Can be used to sign transactions for Ethereum-compatible networks.
        Secp256k1PrehashedKeccak256,
        // Secp256k1 signature over the provided SHA-256 digest.
        Secp256k1PrehashedSha256,
        // Sr25519 signature over the provided message.
        Sr25519
    }

    /**
     * @dev Returns cryptographically secure random bytes.
     * @param numBytes The number of bytes to return.
     * @param pers An optional personalization string to increase domain separation.
     * @return The random bytes. If the number of bytes requested is too large (over 1024), a smaller amount (1024) will be returned.
     */
    function randomBytes(uint256 numBytes, bytes memory pers)
        internal
        view
        returns (bytes memory)
    {
        (bool success, bytes memory entropy) = RANDOM_BYTES.staticcall(
            abi.encode(numBytes, pers)
        );
        require(success, "randomBytes: failed");
        return entropy;
    }

    /**
     * @dev Generates a Curve25519 keypair.
     * @param pers An optional personalization string used to add domain separation.
     * @return pk The Curve25519 public key. Useful for key exchange.
     * @return sk The Curve25519 secret key. Pairs well with {`deriveSymmetricKey`}.
     */
    function generateCurve25519KeyPair(bytes memory pers)
        internal
        view
        returns (Curve25519PublicKey pk, Curve25519SecretKey sk)
    {
        bytes memory scalar = randomBytes(32, pers);
        // Twiddle some bits, as per RFC 7748 §5.
        scalar[0] &= 0xf8; // Make it a multiple of 8 to avoid small subgroup attacks.
        scalar[31] &= 0x7f; // Clamp to < 2^255 - 19
        scalar[31] |= 0x40; // Clamp to >= 2^254
        (bool success, bytes memory pkBytes) = CURVE25519_PUBLIC_KEY.staticcall(
            scalar
        );
        require(success, "gen curve25519 pk: failed");
        return (
            Curve25519PublicKey.wrap(bytes32(pkBytes)),
            Curve25519SecretKey.wrap(bytes32(scalar))
        );
    }

    /**
     * @dev Derive a symmetric key from a pair of keys using x25519.
     * @param peerPublicKey The peer's public key.
     * @param secretKey Your secret key.
     * @return A derived symmetric key.
     */
    function deriveSymmetricKey(
        Curve25519PublicKey peerPublicKey,
        Curve25519SecretKey secretKey
    ) internal view returns (bytes32) {
        (bool success, bytes memory symmetric) = DERIVE_KEY.staticcall(
            abi.encode(peerPublicKey, secretKey)
        );
        require(success, "deriveSymmetricKey: failed");
        return bytes32(symmetric);
    }

    /**
     * @dev Encrypt and authenticate the plaintext and additional data using DeoxysII.
     * @param key The key to use for encryption.
     * @param nonce The nonce. Note that only the first 15 bytes of this parameter are used.
     * @param plaintext The plaintext to encrypt and authenticate.
     * @param additionalData The additional data to authenticate.
     * @return The ciphertext with appended auth tag.
     */
    function encrypt(
        bytes32 key,
        bytes32 nonce,
        bytes memory plaintext,
        bytes memory additionalData
    ) internal view returns (bytes memory) {
        (bool success, bytes memory ciphertext) = ENCRYPT.staticcall(
            abi.encode(key, nonce, plaintext, additionalData)
        );
        require(success, "encrypt: failed");
        return ciphertext;
    }

    /**
     * @dev Decrypt and authenticate the ciphertext and additional data using DeoxysII. Reverts if the auth tag is incorrect.
     * @param key The key to use for decryption.
     * @param nonce The nonce. Note that only the first 15 bytes of this parameter are used.
     * @param ciphertext The ciphertext with tag to decrypt and authenticate.
     * @param additionalData The additional data to authenticate against the ciphertext.
     * @return The original plaintext.
     */
    function decrypt(
        bytes32 key,
        bytes32 nonce,
        bytes memory ciphertext,
        bytes memory additionalData
    ) internal view returns (bytes memory) {
        (bool success, bytes memory plaintext) = DECRYPT.staticcall(
            abi.encode(key, nonce, ciphertext, additionalData)
        );
        require(success, "decrypt: failed");
        return plaintext;
    }

    /**
     * @dev Generate a public/private key pair using the specified method and seed.
     * @param alg The signing alg for which to generate a keypair.
     * @param seed The seed to use for generating the key pair. You can use the `randomBytes` method if you don't already have a seed.
     * @return publicKey The public half of the keypair.
     * @return secretKey The secret half of the keypair.
     */
    function generateSigningKeyPair(SigningAlg alg, bytes memory seed)
        internal
        view
        returns (bytes memory publicKey, bytes memory secretKey)
    {
        (bool success, bytes memory keypair) = GENERAGE_SIGNING_KEYPAIR
            .staticcall(abi.encode(alg, seed));
        require(success, "gen signing keypair: failed");
        return abi.decode(keypair, (bytes, bytes));
    }

    /**
     * @dev Sign a message within the provided context using the specified algorithm, and return the signature.
     * @param alg The signing algorithm to use.
     * @param secretKey The secret key to use for signing. The key must be valid for use with the requested algorithm.
     * @param contextOrHash Domain-Separator Context, or precomputed hash bytes
     * @param message Message to sign, should be zero-length if precomputed hash given
     * @return signature The resulting signature.
     * @custom:see @oasisprotocol/oasis-sdk :: precompile/confidential.rs :: call_sign
     */
    function sign(
        SigningAlg alg,
        bytes memory secretKey,
        bytes memory contextOrHash,
        bytes memory message
    ) internal view returns (bytes memory signature) {
        (bool success, bytes memory sig) = SIGN_DIGEST.staticcall(
            abi.encode(alg, secretKey, contextOrHash, message)
        );
        require(success, "sign: failed");
        return sig;
    }

    /**
     * @dev Verifies that the provided digest was signed with using the secret key corresponding to the provided private key and the specified signing algorithm.
     * @param alg The signing algorithm by which the signature was generated.
     * @param publicKey The public key against which to check the signature.
     * @param contextOrHash Domain-Separator Context, or precomputed hash bytes
     * @param message The hash of the message that was signed, should be zero-length if precomputed hash was given
     * @param signature The signature to check.
     * @return verified Whether the signature is valid for the given parameters.
     * @custom:see @oasisprotocol/oasis-sdk :: precompile/confidential.rs :: call_verify
     */
    function verify(
        SigningAlg alg,
        bytes memory publicKey,
        bytes memory contextOrHash,
        bytes memory message,
        bytes memory signature
    ) internal view returns (bool verified) {
        (bool success, bytes memory v) = VERIFY_DIGEST.staticcall(
            abi.encode(alg, publicKey, contextOrHash, message, signature)
        );
        require(success, "verify: failed");
        return abi.decode(v, (bool));
    }
}
