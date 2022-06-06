import Transaction from "./transaction";

interface TransactionMap {
	[key: string]: Transaction;
}

class TransactionPool {
	public transactionMap: TransactionMap;

	constructor() {
		this.transactionMap = {};
	}

	setTransaction(transaction: Transaction): void {
		console.log("adding transaction: ", transaction);
		this.transactionMap[transaction.id] = transaction;
	}

	existingTransaction({
		inputAddress,
	}: {
		inputAddress: string;
	}): Transaction | undefined {
		const transactions: Transaction[] = Object.values(this.transactionMap);
		console.log("existingTransaction: ", transactions);
		return transactions.find(
			(transaction: Transaction) => transaction.input.address === inputAddress
		);
	}
}

export default TransactionPool;
