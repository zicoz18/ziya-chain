import path from "path";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

import Blockchain from "./blockchain";
import PubSub from "./app/pubsub";
import TransactionPool from "./wallet/transaction-pool";
import Wallet from "./wallet";
import TransactionMiner from "./app/transaction-miner";

let INUSE_PORT;

const main = async () => {
	const app = express();
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, "./explorer/build")));

	const DEFAULT_PORT = 3000;
	const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

	const blockchain = new Blockchain();
	const transactionPool = new TransactionPool();
	const wallet = new Wallet();
	const pubsub = await PubSub.create({
		blockchain,
		transactionPool,
	});
	const transactionMiner = new TransactionMiner({
		blockchain,
		transactionPool,
		wallet,
		pubsub,
	});

	app.get("/api/blocks", (req, res) => {
		res.json(blockchain.chain);
	});

	app.get("/api/blocks/length", (req, res) => {
		res.json(blockchain.chain.length);
	});

	app.get("/api/blocks/:id", (req, res) => {
		const { id } = req.params;
		const { length } = blockchain.chain;

		const blocksReserved = blockchain.chain.slice().reverse();

		let startIndex = (parseInt(id) - 1) * 5;
		let endIndex = parseInt(id) * 5;

		startIndex = startIndex < length ? startIndex : length;
		endIndex = endIndex < length ? endIndex : length;

		res.json(blocksReserved.slice(startIndex, endIndex));
	});

	app.post("/api/mine", (req, res) => {
		const { data } = req.body;

		blockchain.addBlock({ data });
		pubsub.broadcastChain();
		res.redirect("api/blocks");
	});

	app.post("/api/transact", (req, res) => {
		const { amount, recipient }: { amount: number; recipient: string } =
			req.body;

		let transaction = transactionPool.existingTransaction({
			inputAddress: wallet.publicKey,
		});

		try {
			if (transaction) {
				transaction.update({
					senderWallet: wallet,
					recipient,
					amount,
				});
			} else {
				transaction = wallet.createTransaction({
					amount,
					recipient,
					chain: blockchain.chain,
				});
			}
		} catch (error: any) {
			return res.status(400).json({ type: "error", message: error.message });
		}

		transactionPool.setTransaction(transaction);

		pubsub.broadcastTransaction(transaction);

		res.json({ type: "success", transaction });
	});

	app.get("/api/transaction-pool-map", (req, res) => {
		res.json(transactionPool.transactionMap);
	});

	app.get("/api/mine-transactions", (req, res) => {
		transactionMiner.mineTransactions();
		res.redirect("/api/blocks");
	});

	app.get("/api/wallet-info", (req, res) => {
		const address = wallet.publicKey;
		res.json({
			address,
			balance: Wallet.calculateBalance({
				chain: blockchain.chain,
				address,
			}),
		});
	});

	app.get("/api/known-addresses", (req, res) => {
		const addressMap = {} as any;

		for (let block of blockchain.chain) {
			for (let transaction of block.data) {
				const recipient = Object.keys(transaction.outputMap);
				recipient.forEach((recipient) => {
					addressMap[recipient] = recipient;
				});
			}
		}

		res.json(Object.keys(addressMap));
	});

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "./explorer/build", "index.html"));
	});

	const syncWithRootState = async () => {
		try {
			const blocksResponse = await axios.get(`${ROOT_NODE_ADDRESS}/api/blocks`);
			if (blocksResponse.status === 200) {
				console.log("replace chain on a sync with: ", blocksResponse.data);
				blockchain.replaceChain(blocksResponse.data);
			}
			const transactionPoolMapResponse = await axios.get(
				`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`
			);
			if (transactionPoolMapResponse.status === 200) {
				transactionPool.setMap(transactionPoolMapResponse.data);
			}
		} catch (err) {
			console.error("Error syncing the chain: ", err);
		}
	};

	// // Create fake data START
	// const walletFoo = new Wallet();
	// const walletBar = new Wallet();

	// const generateWalletTransaction = ({ wallet, amount, recipient }: any) => {
	// 	const transaction = wallet.createTransaction({
	// 		recipient,
	// 		amount,
	// 		chain: blockchain.chain,
	// 	});
	// 	transactionPool.setTransaction(transaction);
	// };

	// const walletAction = () =>
	// 	generateWalletTransaction({
	// 		wallet: wallet,
	// 		recipient: walletFoo.publicKey,
	// 		amount: 5,
	// 	});

	// const walletFooAction = () =>
	// 	generateWalletTransaction({
	// 		wallet: walletFoo,
	// 		recipient: walletBar.publicKey,
	// 		amount: 10,
	// 	});

	// const walletBarAction = () =>
	// 	generateWalletTransaction({
	// 		wallet: walletBar,
	// 		recipient: wallet.publicKey,
	// 		amount: 15,
	// 	});

	// for (let i = 0; i < 20; i++) {
	// 	if (i % 3 === 0) {
	// 		walletAction();
	// 		walletFooAction();
	// 	} else if (i % 3 === 1) {
	// 		walletAction();
	// 		walletBarAction();
	// 	} else {
	// 		walletFooAction();
	// 		walletBarAction();
	// 	}

	// 	transactionMiner.mineTransactions();
	// }
	// // Create fake data END

	let PEER_PORT;

	if (process.argv[2] === "true") {
		PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
	}

	const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
	INUSE_PORT = PORT;
	app.listen(PORT, () => console.log(`Listening at localhost: ${PORT}`));
	if (PORT !== DEFAULT_PORT) {
		await syncWithRootState();
	}
};

main();

export { INUSE_PORT };
