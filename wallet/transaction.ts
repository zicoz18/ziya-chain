import { v1 as uuid } from "uuid";

class Transaction {
	public id: any;
	public senderWallet: any;
	public recipient: any;
	public amount: any;
	public outputMap: any;

	constructor({ senderWallet, recipient, amount }: any) {
		this.id = uuid();
		this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
	}

	createOutputMap({ senderWallet, recipient, amount }: any) {
		const outputMap: any = {};
		outputMap[recipient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
		return outputMap;
	}
}

export default Transaction;
