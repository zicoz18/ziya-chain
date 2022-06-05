import Transaction from "../../wallet/transaction";
import Wallet from "../../wallet";
import { verifySignature } from "../../utils";

describe("Transaction", () => {
	let transaction: any, senderWallet: any, recipient: any, amount: any;

	beforeEach(() => {
		senderWallet = new Wallet();
		recipient = "recipient-public-key";
		amount = 50;

		transaction = new Transaction({ senderWallet, recipient, amount });
	});

	it("has an `id`", () => {
		expect(transaction).toHaveProperty("id");
	});

	describe("outputMap", () => {
		it("has an `outputMap`", () => {
			expect(transaction).toHaveProperty("outputMap");
		});

		it("outputs the amount to the recipient", () => {
			expect(transaction.outputMap[recipient]).toEqual(amount);
		});

		it("outputs the remaining balance for the `senderWallet`", () => {
			expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
				senderWallet.balance - amount
			);
		});
	});

	describe("input", () => {
		it("has an `input`", () => {
			expect(transaction).toHaveProperty("input");
		});

		it("has an `timestamp` in the input", () => {
			expect(transaction.input).toHaveProperty("timestamp");
		});

		it("sets the `amount` to the `senderWallet`'s balance", () => {
			expect(transaction.input.amount).toEqual(senderWallet.balance);
		});

		it("sets the `address` to the `senderWallet` publicKey", () => {
			expect(transaction.input.address).toEqual(senderWallet.publicKey);
		});

		it("signs the input", () => {
			expect(
				verifySignature({
					publicKey: senderWallet.publicKey,
					data: transaction.outputMap,
					signature: transaction.input.signature,
				})
			).toBe(true);
		});
	});
});
