import { GENESIS_DATA, MINE_RATE } from "../config";
import { cryptoHash } from "../utils";
import hexToBinary from "../utils/hex-to-binary";

class Block {
	public timestamp: number;
	public lastHash: string;
	public hash: string;
	public data: any;
	public nonce: number;
	public difficulty: number;

	constructor({ timestamp, lastHash, hash, data, nonce, difficulty }: Block) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
	}

	public static genesis(): Block {
		return new Block(GENESIS_DATA);
	}

	// Improve input types
	public static mineBlock({ lastBlock, data }: any): Block {
		const lastHash = lastBlock.hash;
		let hash, timestamp;
		let nonce = 0;
		let { difficulty } = lastBlock;

		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty({
				originalBlock: lastBlock,
				timestamp,
			});
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		} while (
			hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
		);

		return new Block({ timestamp, lastHash, hash, difficulty, nonce, data });
	}

	// Improve input types
	public static adjustDifficulty({ originalBlock, timestamp }: any): number {
		const { difficulty } = originalBlock;

		if (difficulty < 1) return 1;

		if (timestamp - originalBlock.timestamp > MINE_RATE) return difficulty - 1;

		return difficulty + 1;
	}
}

export default Block;
