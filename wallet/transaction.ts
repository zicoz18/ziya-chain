import { v1 as uuid } from "uuid";
import { ec as EC } from "elliptic";
import Wallet from ".";
import { verifySignature } from "../utils";
import { MINING_REWARD, REWARD_INPUT } from "../config";

interface ConstructorParamsWithSenderWallet {
	senderWallet: Wallet;
	amount: number;
	recipient: string;
}

interface ConstructorParamsWithoutSenderWallet {
	id: string;
	outputMap: OutputMap;
	input: Input;
}

type ConstructorParams = ConstructorParamsWithoutSenderWallet &
	ConstructorParamsWithSenderWallet;

interface OutputMap {
	[address: string]: number;
}

interface CreateInputAttributes {
	senderWallet: Wallet;
	outputMap: OutputMap;
}

export interface Input {
	timestamp: number;
	amount: number;
	address: string;
	signature: EC.Signature;
}

class Transaction {
	public id: string;
	public outputMap: OutputMap;
	public input: Input;

	constructor({
		senderWallet,
		recipient,
		amount,
		id,
		outputMap,
		input,
	}: Partial<ConstructorParams>) {
		if (senderWallet && recipient && amount) {
			this.id = uuid();
			this.outputMap =
				outputMap ||
				this.createOutputMap({
					senderWallet,
					recipient,
					amount,
				});
			this.input =
				input ||
				this.createInput({
					senderWallet,
					outputMap: this.outputMap,
				});
		} else {
			this.id = <string>id || uuid();
			this.outputMap = outputMap || {};
			this.input = <Input>input || {
				timestamp: 0,
				amount: 0,
				address: "",
				signature: "",
			};
		}
	}

	createOutputMap({
		senderWallet,
		recipient,
		amount,
	}: ConstructorParamsWithSenderWallet): OutputMap {
		const outputMap: OutputMap = {};
		outputMap[recipient] = parseInt(<string>(<unknown>amount));
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
	}: ConstructorParamsWithSenderWallet): void {
		if (amount > this.outputMap[senderWallet.publicKey]) {
			throw new Error("Amount exceeds balance");
		}

		if (!this.outputMap[recipient]) {
			this.outputMap[recipient] = parseInt(<string>(<unknown>amount));
		} else {
			this.outputMap[recipient] =
				this.outputMap[recipient] + parseInt(<string>(<unknown>amount));
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

	public static rewardTransaction({
		minerWallet,
	}: {
		minerWallet: Wallet;
	}): Transaction {
		return new this({
			input: REWARD_INPUT,
			outputMap: {
				[minerWallet.publicKey]: MINING_REWARD,
			},
		});
	}
}

export default Transaction;
