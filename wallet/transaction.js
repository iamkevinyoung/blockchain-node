const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
	constructor() {
		this.id = ChainUtil.id();
		this.input = null; //object
		this.outputs = [];
	}

	//update a transaction if an output address public key already exists
	//check if amount exceeds balance
	//update the amounts for sender and reciever for transactions
	//sign the transaction
	update(senderWallet, recipient, amount) {
		const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
	
		if (amount > senderOutput.amount) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}

		senderOutput.amount = senderOutput.amount - amount;
		this.outputs.push({amount, address: recipient});
		Transaction.signTransaction(this, senderWallet);

		return this;
	}

	//used for new transaction method below
	//create transaction with an array of outputs
	//sign transaction() - line 58
	static transactionWithOutputs(senderWallet, outputs) {
		const transaction = new this();
		transaction.outputs.push(...outputs);
		Transaction.signTransaction(transaction, senderWallet);
		return transaction;
	}

	//check if amount exceeds balance else return undefined
	//do transactionswithoutputs() above with output parameters of an array of the sender object and recipient object
	static newTransaction(senderWallet, recipient, amount) {
		if  (amount > senderWallet.balance) {
			console.log(`Amount: ${amount} exceeds balance.`);
			return;
		}
			return Transaction.transactionWithOutputs(senderWallet, [
			{ amount: senderWallet.balance - amount, address: senderWallet.publicKey },
			{ amount, address: recipient}
		]);
	}

	//used in miner.mine()
	//do transactionWithOutputs() - line 33 to give reward amount to miner
	static rewardTransaction(minerWallet, blockchainWallet) {
		return Transaction.transactionWithOutputs(blockchainWallet, [{
			amount: MINING_REWARD, address: minerWallet.publicKey
		}]);
	}

	//use the sha256 hashing to create a signature
	//put info as an object in transaction.input
	static signTransaction(transaction, senderWallet) {
		transaction.input = {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
		}
	}

	//use sha256 to get the hash and use ec to verify the signature (from utilities file)
	static verifyTransaction(transaction) {
		return ChainUtil.verifySignature(
			transaction.input.address,
			transaction.input.signature,
			ChainUtil.hash(transaction.outputs)
			);
	}
}

module.exports = Transaction;