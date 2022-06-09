import Blockchain from "../blockchain";
import Wallet from "../wallet";
import Transaction from "../wallet/transaction";
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

	mineTransactions() {
		// Get the transaction pool's valid transactions
		const validTransactions = this.transactionPool.validTransactions();
		// Generate the miner's reward
		validTransactions.push(
			Transaction.rewardTransaction({ minerWallet: this.wallet })
		);
		// Add a block consisting of these transactions to the blockchain
		this.blockchain.addBlock({ data: validTransactions });
		// Broadcast the updated blockchain
		this.pubsub.broadcastChain();
		// Clear the transaction pool
		this.transactionPool.clear();
	}
}

export default TransactionMiner;
