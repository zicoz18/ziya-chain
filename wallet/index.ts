import { ec as EC } from "elliptic";
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

	sign(data: any) {
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
}

export default Wallet;
