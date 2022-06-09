import { ec as EC } from "elliptic";
import Block from "../blockchain/block";
import { STARTING_BALANCE } from "../config";
import { ec, cryptoHash } from "../utils";
import Transaction from "./transaction";

interface CreateTransactionAttributes {
	amount: number;
	recipient: string;
	chain?: Block[];
}
class Wallet {
	public balance: number;
	public keyPair: EC.KeyPair;
	public publicKey: string;

	constructor() {
		this.balance = STARTING_BALANCE;
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode("hex", true);
	}

	sign(data: any): EC.Signature {
		return this.keyPair.sign(cryptoHash(data));
	}

	createTransaction({
		amount,
		recipient,
		chain,
	}: CreateTransactionAttributes): Transaction {
		if (chain) {
			this.balance = Wallet.calculateBalance({
				chain,
				address: this.publicKey,
			});
		}

		if (amount > this.balance) {
			throw new Error("Amount exceeds balance");
		}

		return new Transaction({ senderWallet: this, recipient, amount });
	}

	public static calculateBalance({
		chain,
		address,
	}: {
		chain: Block[];
		address: string;
	}): number {
		let hasConductedTransaction = false;
		let outputsTotal = 0;

		for (let i = chain.length - 1; i > 0; i--) {
			const block = chain[i];

			for (let transaction of block.data) {
				if (transaction.input.address === address) {
					hasConductedTransaction = true;
				}

				const addressOutput = transaction.outputMap[address];

				if (addressOutput) {
					outputsTotal += addressOutput;
				}
			}

			if (hasConductedTransaction) {
				break;
			}
		}

		return hasConductedTransaction
			? outputsTotal
			: STARTING_BALANCE + outputsTotal;
	}
}

export default Wallet;
