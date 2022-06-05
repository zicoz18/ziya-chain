import { v1 as uuid } from "uuid";

class Transaction {
	public id: any;
	public senderWallet: any;
	public recipient: any;
	public amount: any;
	public outputMap: any;
	public input: any;

	constructor({ senderWallet, recipient, amount }: any) {
		this.id = uuid();
		this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
		this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
	}

	createOutputMap({ senderWallet, recipient, amount }: any) {
		const outputMap: any = {};
		outputMap[recipient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
		return outputMap;
	}

	createInput({ senderWallet, outputMap }: any) {
		return {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(outputMap),
		};
	}
}

export default Transaction;
