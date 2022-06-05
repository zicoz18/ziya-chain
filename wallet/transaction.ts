import { v1 as uuid } from "uuid";
import { verifySignature } from "../utils";

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

	update({ senderWallet, recipient, amount }: any) {
		if (amount > this.outputMap[senderWallet.publicKey]) {
			throw new Error("Amount exceeds balance");
		}

		if (!this.outputMap[recipient]) {
			this.outputMap[recipient] = amount;
		} else {
			this.outputMap[recipient] = this.outputMap[recipient] + amount;
		}

		this.outputMap[senderWallet.publicKey] =
			this.outputMap[senderWallet.publicKey] - amount;

		this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
	}

	public static validTransaction(transaction: Transaction) {
		const {
			input: { address, amount, signature },
			outputMap,
		} = transaction;

		const outputTotal = Object.values(outputMap).reduce(
			(total: any, outputAmount: any) => total + outputAmount
		);

		if (amount !== outputTotal) {
			console.error(`Invalid transaction from ${address}`);
			return false;
		}

		if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
			console.error(`Invalid signature from ${address}`);
			return false;
		}

		return true;
	}
}

export default Transaction;
