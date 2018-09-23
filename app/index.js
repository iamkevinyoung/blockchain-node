const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server')
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

//you either connect to a provided env variable http port or localhost:/3001 if nothing provided
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create instances
const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

//to post data, express needs body parser
app.use(bodyParser.json());

//get a respose of the blockchain chain
app.get('/blocks', (req, res) => {
	res.json(bc.chain);
});

// send a request containing data on a block, add this to the chian, sync the chains for all other sockets, do the get blocks method (line 23)
app.post('/mine', (req, res) => {
	const block = bc.addBlock(req.body.data);
	console.log(`New block added!: ${block.toString()}`);

	p2pServer.syncChains();

	res.redirect('/blocks')
});

// get a response of the transactions of the transactions pool
app.get('/transactions', (req, res) => {
	res.json(tp.transactions);
});

// send a request containing data for the transaction and create a transaction with this sockets blockchain and this transaction pool, 
// p2p broadcasts transaction , do the get transactions method (line 37)
app.post('/transact', (req, res) => {
	const { recipient, amount } = req.body;
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);
	p2pServer.broadcastTransaction(transaction);
	res.redirect('/transactions');
});

//mine transactions to add a block with miner.mine function, do get blocks (line 23)
app.get('/mine-transactions', (req, res) => {
	const block = miner.mine();
	console.log(`New block added: ${block.toString()}`);
	res.redirect('/blocks');
});

// get this wallet's public key
app.get('/public-key', (req, res) => {
	res.json({publicKey:wallet.publicKey});
});

//express
app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}!`));
p2pServer.listen();