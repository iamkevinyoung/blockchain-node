const Websocket = require ('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES= {
	chain: 'CHAIN',
	transaction: 'TRANSACTION',
	clear_transaactions: 'CLEAR_TRANSACTIONS'
};

class P2pServer {
	constructor(blockchain, transactionPool) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.sockets = [];
	}

	listen() {
		const server = new Websocket.Server({ port: P2P_PORT});
		server.on('connection', socket => this.connectSocket(socket));

		this.connectToPeers();

		console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}!`);
	}

	connectToPeers() {
		peers.forEach(peer => {
			const socket = new Websocket(peer);

			socket.on('open', () => this.connectSocket(socket));
		});
	}

	connectSocket(socket) {
		this.sockets.push(socket);
		console.log('Socket connected!')
		
		this.messageHandler(socket);

		this.sendChain(socket);
	}

	messageHandler(socket) {
		socket.on('message', message => {
			const data = JSON.parse(message);
			switch(data.type) {
				case MESSAGE_TYPES.chain:
					this.blockchain.replaceChain(data.chain);
					break;
				case MESSAGE_TYPES.transaction:
					this.transactionPool.updateOrAddTransaction(data.transaction);
					break;
				case MESSAGE_TYPES.clear_transactions:
					this.transactionPool.clear();
					break;
			}
		});
	}

	//Send a stringified object specifying the type of message being send (a chain) and the chain itself (an array of blocks - blockchain/index).
	sendChain(socket) {
		socket.send(JSON.stringify({
			type : MESSAGE_TYPES.chain,
			chain: this.blockchain.chain
		}));
	}

	//Send a stringified object specifying the type of message being send (a transaction) and the transaction ?itself in the socket?
	sendTransaction(socket, transaction) {
		socket.send(JSON.stringify({
			type: MESSAGE_TYPES.transaction,
			transaction
		}));
	}

	//Methods below are for mine() function in the mine class.


	//For every socket in the socket array attribute of the p2p-server, sendChain() - line 61 
	syncChains() {
		this.sockets.forEach(socket => this.sendChain(socket));
	}

	//this is not used in miner, but used in app/index.post/transact
	//For every socket in the socket array attribute of the p2p-server, sendTransaction() - line 68 
	broadcastTransaction(transaction) {
		this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
	}

	broadcastClearTransactions() {
		this.sockets.forEach(socket => socket.send(JSON.stringify({
			type: MESSAGE_TYPES.clear_transactions
		})));
	}
}

module.exports = P2pServer;