import Block from "./block";
import { GENESIS_DATA } from "./config";

describe("Block", () => {
	const timestamp = "a-date";
	const lastHash = "foo-hash";
	const hash = "bar-hash";
	const data = ["blockchain", "data"];
	const block = new Block({ timestamp, lastHash, hash, data });

	it("has a timestamp, lastHash, hash, data property", () => {
		expect(block.timestamp).toEqual(timestamp);
		expect(block.lastHash).toEqual(lastHash);
		expect(block.hash).toEqual(hash);
		expect(block.data).toEqual(data);
	});

	describe("genesis()", () => {
		const genesisBlock = Block.genesis();

		it("returns a Block instance", () => {
			expect(genesisBlock instanceof Block).toBe(true);
		});

		it("returns the genesis data", () => {
			expect(genesisBlock).toEqual(GENESIS_DATA);
		});
	});
});
