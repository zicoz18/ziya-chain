import TransactionPool from "../../wallet/transaction-pool";
import Transaction from "../../wallet/transaction";
import Wallet from "../../wallet";

describe("TransactionPool", () => {
	let transactionPool: TransactionPool,
		transaction: Transaction,
		senderWallet: Wallet;

	beforeEach(() => {
		transactionPool = new TransactionPool();
		senderWallet = new Wallet();
		transaction = transaction = new Transaction({
			senderWallet,
			recipient: "foo-recipient",
			amount: 50,
		});
	});

	describe("setTransaction()", () => {
		it("adds a transaction to the pool", () => {
			transactionPool.setTransaction(transaction);

			expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
		});
	});

	describe("existingTransaction()", () => {
		it("returns an existing transaction given an input address", () => {
			transactionPool.setTransaction(transaction);

			expect(
				transactionPool.existingTransaction({
					inputAddress: senderWallet.publicKey,
				})
			).toBe(transaction);
		});

		it("returns an existing transaction if it is not in the pool", () => {
			expect(
				transactionPool.existingTransaction({
					inputAddress: transaction.input.address,
				})
			).toBeUndefined();
		});
	});
});
