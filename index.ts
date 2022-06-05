import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import Blockchain from "./blockchain";
import PubSub from "./app/pubsub";
import TransactionPool from "./wallet/transaction-pool";
import Wallet from "./wallet";

const main = async () => {
	const app = express();
	app.use(bodyParser.json());
	const blockchain = new Blockchain();
	const transactionPool = new TransactionPool();
	const wallet = new Wallet();
	const pubsub = await PubSub.create({ blockchain });

	const DEFAULT_PORT = 3000;
	const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}/api/blocks`;

	app.get("/api/blocks", (req, res) => {
		res.json(blockchain.chain);
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
				transaction.update({ senderWallet: wallet, recipient, amount });
			} else {
				transaction = wallet.createTransaction({ amount, recipient });
			}
		} catch (error: any) {
			return res.status(400).json({ type: "error", message: error.message });
		}

		transactionPool.setTransaction(transaction);

		console.log("transactionPool: ", transactionPool);
		res.json({ type: "success", transaction });
	});

	const syncChains = async () => {
		try {
			const response = await axios.get(ROOT_NODE_ADDRESS);
			if (response.status === 200) {
				console.log("replace chain on a sync with: ", response.data);
				blockchain.replaceChain(response.data);
			} else {
				console.log("not inside");
			}
		} catch (err) {
			console.error("Error syncing the chain: ", err);
		}
	};

	let PEER_PORT;

	if (process.argv[2] === "true") {
		PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
	}

	const PORT = PEER_PORT || DEFAULT_PORT;
	app.listen(PORT, () => console.log(`Listening at localhost:${PORT}`));
	if (PORT !== DEFAULT_PORT) {
		await syncChains();
	}
};

main();
