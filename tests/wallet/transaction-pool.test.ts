import TransactionPool from "../../wallet/transaction-pool";
import Transaction from "../../wallet/transaction";
import Wallet from "../../wallet";
import Blockchain from "../../blockchain";

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

	describe("validTransactions()", () => {
		let validTransactions: Transaction[], errorMock: any;

		beforeEach(() => {
			validTransactions = [];
			errorMock = jest.fn();
			global.console.error = errorMock;
			for (let i = 0; i < 10; i++) {
				transaction = new Transaction({
					senderWallet,
					recipient: "any-recipient",
					amount: 30,
				});

				if (i % 3 === 0) {
					transaction.input.amount = 999999;
				} else if (i % 3 === 1) {
					transaction.input.signature = new Wallet().sign("foo");
				} else {
					validTransactions.push(transaction);
				}

				transactionPool.setTransaction(transaction);
			}
		});

		it("returns valid transactions", () => {
			expect(transactionPool.validTransactions()).toEqual(validTransactions);
		});

		it("logs errors for the invalid transactions", () => {
			transactionPool.validTransactions();

			expect(errorMock).toHaveBeenCalled();
		});
	});

	describe("clear()", () => {
		it("clears the transactions", () => {
			transactionPool.clear();

			expect(transactionPool.transactionMap).toEqual({});
		});
	});

	describe("clearBlockchainTransactions()", () => {
		it("clears the pool of any existing blockchain transactions", () => {
			const blockchain = new Blockchain();
			const expectedTransactionMap: any = {};
			for (let i = 0; i < 6; i++) {
				const transaction = new Wallet().createTransaction({
					recipient: "foo-recipient",
					amount: 20,
				});

				transactionPool.setTransaction(transaction);

				if (i % 2 === 0) {
					blockchain.addBlock({ data: [transaction] });
				} else {
					expectedTransactionMap[transaction.id] = transaction;
				}
			}

			transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
			expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
		});
	});
});
