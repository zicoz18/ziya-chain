import Block from "./block";
import cryptoHash from "../utils/crypto-hash";

class Blockchain {
	public chain: Block[];

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ data }: any): void {
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length - 1],
			data,
		});

		this.chain.push(newBlock);
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

	replaceChain(chain: Block[]): void | boolean {
		if (chain.length <= this.chain.length) {
			console.error("The incoming chain must be longer");
			return false;
		}

		if (!Blockchain.isValidChain(chain)) {
			console.error("The incoming chain must be valid");
			return false;
		}

		console.log("replacing chain with: ", chain);
		this.chain = chain;
	}
}

export default Blockchain;
