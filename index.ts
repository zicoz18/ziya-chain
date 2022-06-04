import express from "express";
import bodyParser from "body-parser";
import Blockchain from "./models/blockchain";
import PubSub from "./models/pubsub";

const main = async () => {
	const app = express();
	app.use(bodyParser.json());
	const blockchain = new Blockchain();
	const pubsub = await PubSub.create({ blockchain });

	pubsub.broadcastChain();

	app.get("/api/blocks", (req, res) => {
		res.json(blockchain.chain);
	});

	app.post("/api/mine", (req, res) => {
		const { data } = req.body;

		blockchain.addBlock({ data });
		res.redirect("api/blocks");
	});

	const PORT = 3000;
	app.listen(PORT, () => console.log(`Listening at localhost:${PORT}`));
};

main();
