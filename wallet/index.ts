import { STARTING_BALANCE } from "../config";
import { ec, cryptoHash } from "../utils";
import Transaction from "./transaction";

class Wallet {
	public balance: number;
	public keyPair: any;
	public publicKey: any;

	constructor() {
		this.balance = STARTING_BALANCE;

		this.keyPair = ec.genKeyPair();

		this.publicKey = this.keyPair.getPublic().encode("hex");
	}

	sign(data: any) {
		return this.keyPair.sign(cryptoHash(data));
	}

	createTransaction({ amount, recipient }: any): Transaction {
		if (amount > this.balance) {
			throw new Error("Amount exceeds balance");
		}

		return new Transaction({ senderWallet: this, recipient, amount });
	}
}

export default Wallet;
