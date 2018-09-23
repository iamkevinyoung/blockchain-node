const Transaction = require('../wallet/transaction');

class TransactionPool {
	constructor() {
		this.transactions = [];
	}

	//if transaction with same id already exists, change this transaction in the transactions array
	//update the transactions array by adding another transaction at the end
	updateOrAddTransaction(transaction) {
		let transactionWithId = this.transactions.find( t => t.id === transaction.id);
	
		if (transactionWithId) {
			this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
		} else {
			this.transactions.push(transaction);
		}
	}

	//check if a transaction already exists with the input.address
	existingTransaction(address) {
		return this.transactions.find(t => t.input.address === address);
	}

	//used in miner.mine()
	//?check if transaction is valid
	validTransactions() {
		return this.transactions.filter(transaction => {
			const outputTotal = transaction.outputs.reduce((total, output) => {
				return total + output.amount;
			}, 0);

			if (transaction.input.amount !== outputTotal) {
				console.log(`Invalid transaction from ${transaction.input.address}`);
				return;
			}

			if (!Transaction.verifyTransaction(transaction)) {
				console.log(`Invalid signature from ${transaction.input.address}.`);
				return;
			}

			return transaction;
		});
	}

	//clear the transactions array
	clear() {
		this.transactions = [];
	}
}

module.exports = TransactionPool;