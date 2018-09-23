const ChainUtil = require('../chain-util');

const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
	constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce
		this.difficulty = difficulty || DIFFICULTY;
	}

	toString() {
		//Only 10 chatacters will show up for the hashes as hashes are very long - substring
		return `Block - 
			Timestamp : ${this.timestamp}
			Last Hash : ${this.lastHash.substring(0,10)} 
			Hash      : ${this.hash.substring(0,10)}
			Nonce     : ${this.nonce}
			Difficulty: ${this.difficulty}
			Data      : ${this.data}`;
	}

	//return the first block in the chain
	static genesis() {
		return new this('Genesis time', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
	}

	//blockchain/index.addBlock() uses this method
	//hash must match 0.repeat(difficulty), matches are slower/faster depending on the difficulty
	//while there's no match, difficulty keeps adjusting using adjustDifficulty() requiring given parameters
	//												also hash keeps changing
	static mineBlock(lastBlock, data) {
		 let hash, timestamp;
		 const lastHash = lastBlock.hash;
		 let { difficulty } = lastBlock;
		 let nonce = 0;

		 do {
		 		nonce++;
		 		timestamp = Date.now();
		 		difficulty = Block.adjustDifficulty(lastBlock, timestamp);
		 		hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
		 } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

		 return new this(timestamp, lastHash, hash, data, nonce, difficulty);
	}

	//use sha256 hash algorithm in utilities based on block attributes and return a result as a string
	static hash(timestamp, lastHash, data, nonce, difficulty) {
		return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
	}

	//grab the attributes from this block to do the above hash method
	static blockHash(block) {
		const {timestamp, lastHash, data, nonce, difficulty } = block;
		return Block.hash(timestamp, lastHash, data, nonce, difficulty);
	}

	//used in mineBLock() -line 34
	//difficulty increase/decrease by 1 depending on if the time to mine the block + previous time is higher/ lower than the current time (slow or quick)
	static adjustDifficulty(lastBlock, currentTime) {
		let { difficulty } = lastBlock;
		difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty -1
		return difficulty;
	}
}

module.exports = Block;