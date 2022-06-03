import { GENESIS_DATA } from "./config";

class Block {
	public timestamp: any;
	public lastHash: any;
	public hash: any;
	public data: any;

	constructor({ timestamp, lastHash, hash, data }: any) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
	}

	public static genesis(): any {
		return new Block(GENESIS_DATA);
	}

	public static mineBlock({ lastBlock, data }: any): any {
		const timestamp = Date.now();
		const lastHash = lastBlock.hash;
		const hash = "hash";

		return new Block({ timestamp, lastHash, hash, data });
	}
}

export default Block;
