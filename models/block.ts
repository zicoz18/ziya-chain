import { GENESIS_DATA } from "../config";
import cryptoHash from "../utils/crypto-hash";

class Block {
	public timestamp: any;
	public lastHash: any;
	public hash: any;
	public data: any;
	public nonce: any;
	public difficulty: any;

	constructor({ timestamp, lastHash, hash, data, nonce, difficulty }: any) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
	}

	public static genesis(): any {
		return new Block(GENESIS_DATA);
	}

	public static mineBlock({ lastBlock, data }: any): any {
		let hash, timestamp;
		let nonce = 0;

		const lastHash = lastBlock.hash;
		const { difficulty } = lastBlock;

		do {
			nonce++;
			timestamp = Date.now();
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		} while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

		return new Block({ timestamp, lastHash, hash, difficulty, nonce, data });
	}
}

export default Block;
