import { ec as EC } from "elliptic";
import Block from "../blockchain/block";
import { STARTING_BALANCE } from "../config";
import { ec, cryptoHash } from "../utils";
import Transaction from "./transaction";

interface CreateTransactionAttributes {
	amount: number;
	recipient: string;
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
	}: CreateTransactionAttributes): Transaction {
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
		let outputsTotal = 0;

		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];
			for (let transaction of block.data) {
				const addressOutput = transaction.outputMap[address];
				if (addressOutput) {
					outputsTotal += addressOutput;
				}
			}
		}

		return STARTING_BALANCE + outputsTotal;
	}
}

export default Wallet;
