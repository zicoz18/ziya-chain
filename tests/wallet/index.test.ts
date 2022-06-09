import Wallet from "../../wallet";
import { verifySignature } from "../../utils";
import Transaction from "../../wallet/transaction";
import Blockchain from "../../blockchain";
import { STARTING_BALANCE } from "../../config";

describe("Wallet", () => {
	let wallet: Wallet;

	beforeEach(() => {
		wallet = new Wallet();
	});

	it("has a `balance`", () => {
		expect(wallet).toHaveProperty("balance");
	});

	it("has a `publicKey`", () => {
		expect(wallet).toHaveProperty("publicKey");
	});

	describe("signing data", () => {
		const data = "foo bar";

		it("verifies a signature", () => {
			expect(
				verifySignature({
					publicKey: wallet.publicKey,
					data,
					signature: wallet.sign(data),
				})
			).toBe(true);
		});

		it("does not verify invalid signature", () => {
			expect(
				verifySignature({
					publicKey: wallet.publicKey,
					data,
					signature: new Wallet().sign(data),
				})
			).toBe(false);
		});
	});

	describe("createTransaction()", () => {
		describe("and the amount exceeds the balance", () => {
			it("throws an error", () => {
				expect(() =>
					wallet.createTransaction({
						amount: 999999,
						recipient: "foo-recipient",
					})
				).toThrow("Amount exceeds balance");
			});
		});

		describe("and the amount is valid", () => {
			let transaction: Transaction, amount: number, recipient: string;

			beforeEach(() => {
				amount = 50;
				recipient = "foo-recipient";
				transaction = wallet.createTransaction({ amount, recipient });
			});

			it("creates an instance of `Transaction`", () => {
				expect(transaction instanceof Transaction).toBe(true);
			});

			it("matches the transaction input with the wallet", () => {
				expect(transaction.input.address).toEqual(wallet.publicKey);
			});

			it("outputs the amount the recipient", () => {
				expect(transaction.outputMap[recipient]).toEqual(amount);
			});
		});
	});
	describe("calculateBalance()", () => {
		let blockchain: Blockchain;

		beforeEach(() => {
			blockchain = new Blockchain();
		});

		describe("and there are no ouputs for the wallet", () => {
			it("returns the `STARTING_BALANCE`", () => {
				expect(
					Wallet.calculateBalance({
						chain: blockchain.chain,
						address: wallet.publicKey,
					})
				).toEqual(STARTING_BALANCE);
			});
		});

		describe("and there are outputs for the wallet", () => {
			let transactionOne: Transaction, transactionTwo: Transaction;

			beforeEach(() => {
				transactionOne = new Wallet().createTransaction({
					recipient: wallet.publicKey,
					amount: 50,
				});

				transactionTwo = new Wallet().createTransaction({
					recipient: wallet.publicKey,
					amount: 60,
				});

				blockchain.addBlock({ data: [transactionOne, transactionTwo] });
			});

			it("adds the sum of all outputs to the wallet balance", () => {
				expect(
					Wallet.calculateBalance({
						chain: blockchain.chain,
						address: wallet.publicKey,
					})
				).toEqual(
					STARTING_BALANCE +
						transactionOne.outputMap[wallet.publicKey] +
						transactionTwo.outputMap[wallet.publicKey]
				);
			});
		});
	});
});
