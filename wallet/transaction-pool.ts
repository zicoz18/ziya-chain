import Block from "../blockchain/block";
import Transaction from "./transaction";

interface TransactionMap {
	[key: string]: Transaction;
}

class TransactionPool {
	public transactionMap: TransactionMap;

	constructor() {
		this.transactionMap = {};
	}

	clear(): void {
		this.transactionMap = {};
	}

	setTransaction(transaction: Transaction): void {
		this.transactionMap[transaction.id] = transaction;
	}

	setMap(transactionMap: TransactionMap): void {
		this.transactionMap = transactionMap;
	}

	existingTransaction({
		inputAddress,
	}: {
		inputAddress: string;
	}): Transaction | undefined {
		const transactions: Transaction[] = Object.values(this.transactionMap);
		return transactions.find(
			(transaction: Transaction) => transaction.input.address === inputAddress
		);
	}

	validTransactions(): Transaction[] {
		return Object.values(this.transactionMap).filter(
			(transaction: Transaction) => Transaction.validTransaction(transaction)
		);
	}

	clearBlockchainTransactions({ chain }: { chain: Block[] }) {
		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];
			for (let transaction of block.data) {
				if (this.transactionMap[transaction.id]) {
					delete this.transactionMap[transaction.id];
				}
			}
		}
	}
}

export default TransactionPool;
