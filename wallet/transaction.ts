import { v1 as uuid } from "uuid";
import { ec as EC } from "elliptic";
import Wallet from ".";
import { verifySignature } from "../utils";

interface CreateTransactionAttributes {
	senderWallet: Wallet;
	amount: number;
	recipient: string;
}

interface OutputMap {
	[address: string]: number;
}

interface CreateInputAttributes {
	senderWallet: Wallet;
	outputMap: OutputMap;
}

interface Input {
	timestamp: number;
	amount: number;
	address: string;
	signature: EC.Signature;
}

class Transaction {
	public id: string;
	public senderWallet?: Wallet;
	public recipient?: string;
	public amount?: number;
	public outputMap: OutputMap;
	public input: Input;

	constructor({
		senderWallet,
		recipient,
		amount,
	}: CreateTransactionAttributes) {
		this.id = uuid();
		this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
		this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
	}

	createOutputMap({
		senderWallet,
		recipient,
		amount,
	}: CreateTransactionAttributes): OutputMap {
		const outputMap: OutputMap = {};
		outputMap[recipient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
		return outputMap;
	}

	createInput({ senderWallet, outputMap }: CreateInputAttributes): Input {
		return {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(outputMap),
		};
	}

	update({
		senderWallet,
		recipient,
		amount,
	}: CreateTransactionAttributes): void {
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

	public static validTransaction(transaction: Transaction): boolean {
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
