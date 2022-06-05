import { STARTING_BALANCE } from "../config";
import { ec, cryptoHash } from "../utils";

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
}

export default Wallet;
