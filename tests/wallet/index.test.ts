import Wallet from "../../wallet";
import { verifySignature } from "../../utils";

describe("Wallet", () => {
	let wallet: Wallet;

	beforeEach(() => {
		wallet = new Wallet();
	});

	it("has a `balance`", () => {
		expect(wallet).toHaveProperty("balance");
	});

	it("has a `publicKey`", () => {
		console.log("publicKey: ", wallet.publicKey);
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
});
