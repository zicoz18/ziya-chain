import Blockchain from "../blockchain";
import Wallet from "../wallet";
import TransactionPool from "../wallet/transaction-pool";
import PubSub from "./pubsub";

interface ConstructorParams {
	blockchain: Blockchain;
	transactionPool: TransactionPool;
	wallet: Wallet;
	pubsub: PubSub;
}

class TransactionMiner {
	public blockchain: Blockchain;
	public transactionPool: TransactionPool;
	public wallet: Wallet;
	public pubsub: PubSub;

	constructor({
		blockchain,
		transactionPool,
		wallet,
		pubsub,
	}: ConstructorParams) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubsub = pubsub;
	}

	mineTransaction() {
		// Get the transaction pool's valid transactions
		// Generate the miner's reward
		// Add a block consisting of these transactions to the blockchain
		// Broadcst the updated blockchain
		// Clear the transaction pool
	}
}

export default TransactionMiner;
