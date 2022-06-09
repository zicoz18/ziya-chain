import Block from "./block";
import { cryptoHash } from "../utils";
import { MINING_REWARD, REWARD_INPUT } from "../config";
import Transaction from "../wallet/transaction";
import Wallet from "../wallet";

class Blockchain {
	public chain: Block[];

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ data }: { data: Transaction[] | string }): void {
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length - 1],
			data,
		});

		this.chain.push(newBlock);
	}

	validTransactionData({ chain }: { chain: Block[] }): boolean {
		for (let i = 1; i < chain.length; i++) {
			const block = chain[i];
			let rewardTransactionCount = 0;
			const transactionSet = new Set();
			for (let transaction of block.data) {
				if (transaction.input.address === REWARD_INPUT.address) {
					rewardTransactionCount++;
					if (rewardTransactionCount > 1) {
						console.error("Miner rewards exceed limit");
						return false;
					}

					if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
						console.error("Miner reward amount is invalid");
						return false;
					}
				} else {
					if (!Transaction.validTransaction(transaction)) {
						console.error("Invalid transaction");
						return false;
					}
					const trueBalance = Wallet.calculateBalance({
						chain: this.chain,
						address: transaction.input.address,
					});

					if (transaction.input.amount !== trueBalance) {
						console.error("Invalid input amount");
						return false;
					}

					if (transactionSet.has(transaction)) {
						console.error("An identical transaction appears more than once");
						return false;
					} else {
						transactionSet.add(transaction);
					}
				}
			}
		}
		return true;
	}

	public static isValidChain(chain: Block[]): boolean {
		if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
			return false;

		for (let i = 1; i < chain.length; i++) {
			const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
			const actualLastHash = chain[i - 1].hash;
			const lastDifficulty = chain[i - 1].difficulty;

			if (actualLastHash !== lastHash) return false;

			const validatedHash = cryptoHash(
				timestamp,
				lastHash,
				nonce,
				difficulty,
				data
			);

			if (validatedHash !== hash) return false;

			if (Math.abs(lastDifficulty - difficulty) > 1) return false;
		}

		return true;
	}

	replaceChain(chain: Block[], onSuccess?: () => void): void | boolean {
		if (chain.length <= this.chain.length) {
			console.error("The incoming chain must be longer");
			return false;
		}

		if (!Blockchain.isValidChain(chain)) {
			console.error("The incoming chain must be valid");
			return false;
		}

		if (onSuccess) onSuccess();

		console.log("replacing chain with: ", chain);
		this.chain = chain;
	}
}

export default Blockchain;
