const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

class Wallet {
	constructor() {
		this.balance = INITIAL_BALANCE;
		this.keyPair = ChainUtil.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	toString() {
		return `Wallet - 
			publicKey: ${this.publicKey.toString()}
			balance  : ${this.balance}`
	}

	//used in signTransaction
	//use the ec package in the utilities file to sign wallet's public/private with ChainUtil.hash(transaction.outputs) in signTransaction
	sign(dataHash) {
		return this.keyPair.sign(dataHash);
	}

	//get the balance of the blockchain, if amount to transact is more than balance, return undifined
	//otherwise, get this wallet's transaction in the transaction pool if there is one then update it with a new recipient and amount
	//else, create a new transaction
	createTransaction(recipient, amount, blockchain, transactionPool) {
		this.balance = this.calculateBalance(blockchain);

		if (amount > this.balance) {
			console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
			return;
		}

		let transaction = transactionPool.existingTransaction(this.publicKey);

		if (transaction) {
			transaction.update(this, recipient, amount);
		} else {
			transaction = Transaction.newTransaction(this, recipient, amount);
			transactionPool.updateOrAddTransaction(transaction);
		}
		return transaction;
	}

	//from blockchain from each block get an array of transactions
	// then boil that down to transactions that are devoted to the wallets input
	// then find the most recent one
	calculateBalance(blockchain) {
		let balance = this.balance;
		let transactions = [];
		blockchain.chain.forEach(block => block.data.forEach(transaction => {
			transactions.push(transaction);
		}));

		//subset of transactions in array
		const walletInputTs = transactions
			.filter(transaction => transaction.input.address === this.publicKey);

		let startTime = 0;

		//if there are transactions in the array, get the most recent one, then change the output public key amount
			if (walletInputTs.length > 0) {
		const recentInputT = walletInputTs.reduce(
			(prev, current ) => prev.input.timestamp > current.input.timestamp ? prev : current
			);

			balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
			startTime = recentInputT.input.timestamp;
		}

		//
		transactions.forEach(transaction => {
			if (transaction.input.timestamp > startTime) {
				transaction.outputs.find(output => {
					if (output.address == this.publicKey) {
						balance += output.amount;
					}
				});
			}
		});

	return balance;
	}

	//create a blockchain wallet
	static blockchainWallet() {
		const blockchainWallet = new this();
		blockchainWallet.address = 'blockchain-wallet';
		return blockchainWallet;
	}
}

module.exports = Wallet;