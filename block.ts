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
}

export default Block;
