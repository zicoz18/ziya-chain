import Transaction from "./transaction";

class TransactionPool {
	public transactionMap: any;

	constructor() {
		this.transactionMap = {};
	}

	setTransaction(transaction: Transaction): void {
		this.transactionMap[transaction.id] = transaction;
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
}

export default TransactionPool;
