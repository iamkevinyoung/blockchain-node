const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction')

class Miner {
	constructor(blockchain, transactionPool, wallet, p2pServer) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.p2pServer = p2pServer;
	}

	//used in app.index.js.app.get/mine-transactions
	mine() {
		//Get an array of the valid transactions from the transaction pool
		const validTransactions = this.transactionPool.validTransactions();

		//Include a reward for the miner by adding a reward transaction to the array
		validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
			);

		//Create a block of the valid transactions
		const block = this.blockchain.addBlock(validTransactions);
		
		// Sync the chains in the p2p server
		this.p2pServer.syncChains();
		
		// Clear the transaction pool
		this.transactionPool.clear();
		
		// Broadcast to every miner to clear their transaction pools
		this.p2pServer.broadcastClearTransactions();

		return block;
	}
}

module.exports = Miner;