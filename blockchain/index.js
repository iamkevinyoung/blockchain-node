const Block = require('./block');

class Blockchain {
	constructor() {
		this.chain = [Block.genesis()];

	}

	//create a block where last block parameter in mineBlock is the last item in the array, return it
	addBlock(data) {
		const block = Block.mineBlock(this.chain[this.chain.length-1], data);
		this.chain.push(block);

		return block;
	}

	//Before comparing chains for one to be replaced, check that the other chain to be compared is a valid chain to compare.
	//The first block in the chain array needs to match up and make sense
	//the lastblock and current block hashes in the array need to match up and make sense
	isValidChain(chain) {
		if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];
			const lastBlock = chain[i - 1];

			if (block.lastHash !== lastBlock.hash || 
					block.hash !== Block.blockHash(block)) {
				return false;
			}
		} return true;
	}

	//The longer chain will stay, if the new chain is longer the original is replaced.
	replaceChain(newChain) {
		if (newChain.length <= this.chain.length) {
			console.log('Received chain is not longer than the current chain.');
			return;
		} else if (!this.isValidChain(newChain)) {
			console.log('Received chain is not valid.');
			return;
		}

		console.log('Replacing blockchain with the new chain.');
		this.chain = newChain;
	}
}

module.exports = Blockchain;