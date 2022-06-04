import Block from "./block";
import cryptoHash from "../utils/crypto-hash";

class Blockchain {
	public chain: any[];

	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ data }: any) {
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length - 1],
			data,
		});

		this.chain.push(newBlock);
	}

	public static isValidChain(chain: any[]) {
		if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
			return false;

		for (let i = 1; i < chain.length; i++) {
			const { timestamp, lastHash, data, hash } = chain[i];
			const actualLastHash = chain[i - 1].hash;

			if (actualLastHash !== lastHash) return false;

			const validatedHash = cryptoHash(timestamp, lastHash, data);

			if (validatedHash !== hash) return false;
		}

		return true;
	}
}

export default Blockchain;
