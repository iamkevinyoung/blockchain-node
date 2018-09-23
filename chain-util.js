//Utilities from packages

//creates public/private key pairs (for digital signatures)
const EC = require('elliptic').ec;
//the hash algorithm - hashes have 256 bits (32 characters)
const SHA256 = require('crypto-js/sha256');
//Unique id maker
const uuidV1 = require('uuid/v1');

// secp256k1 - parameters of the elliptic curve used in Bitcoin's public-key cryptography, and is defined in Standards for Efficient Cryptography 
const ec = new EC('secp256k1');

class ChainUtil {

	//return a key pair with the secp256k1 parameters
	static genKeyPair() {
		return ec.genKeyPair();
	}

	//return an id for the ??
	static id() {
		return uuidV1();
	}

	//return a hash for the ??
	static hash(data) {
		return SHA256(JSON.stringify(data)).toString();
	}

	//verify a transaction signature using ec package - it looks at the publickey that was ?encrypted? in hex and verifies that it works with the signature and ?dataHash?
	static verifySignature(publicKey, signature, dataHash) {
		return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
	}
}

module.exports = ChainUtil;