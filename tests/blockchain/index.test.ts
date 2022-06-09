import Blockchain from "../../blockchain";
import Block from "../../blockchain/block";
import { cryptoHash } from "../../utils/";
import Wallet from "../../wallet";
import Transaction from "../../wallet/transaction";
import { ec as EC } from "elliptic";

describe("Blockchain", () => {
	let blockchain: Blockchain,
		newChain: Blockchain,
		originalChain: Block[],
		errorMock: any;

	beforeEach(() => {
		blockchain = new Blockchain();
		newChain = new Blockchain();

		errorMock = jest.fn();
		global.console.error = errorMock;

		originalChain = blockchain.chain;
	});

	it("contains a `chain` Array instance", () => {
		expect(blockchain.chain instanceof Array).toBe(true);
	});

	it("starts with a genesis block", () => {
		expect(blockchain.chain[0]).toEqual(Block.genesis());
	});

	it("adds a new block to the chain", () => {
		const newData = "foo bar";
		blockchain.addBlock({ data: newData });

		expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
	});

	describe("isValidaChain()", () => {
		describe("when the chain does not start with the genesis block", () => {
			it("returns false", () => {
				blockchain.chain[0] = new Block({
					timestamp: 1,
					lastHash: "foo",
					hash: "bar",
					nonce: 0,
					difficulty: 3,
					data: [],
				});

				expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
			});
		});

		describe("when the chain starts with the genesis block and has multiple blocks", () => {
			beforeEach(() => {
				blockchain.addBlock({ data: "Bears" });
				blockchain.addBlock({ data: "Beets" });
				blockchain.addBlock({ data: "Battlestar Galactica" });
			});

			describe("and a lastHash reference has changed", () => {
				it("returns false", () => {
					blockchain.chain[2].lastHash = "broken-lastHash";
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe("and the chain contains a block with an invalid field", () => {
				it("returns false", () => {
					blockchain.chain[2].data = "some-bad-and-evil-data";
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe("and the chain does not contain any invalid blocks", () => {
				it("returns true", () => {
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
				});
			});

			describe("and the chain	contains a block with a jumped difficulty", () => {
				it("returns false", () => {
					const lastBlock = blockchain.chain[blockchain.chain.length - 1];
					const lastHash = lastBlock.hash;
					const timestamp = Date.now();
					const nonce = 0;
					const data: any[] = [];
					const difficulty = lastBlock.difficulty - 3;
					const hash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
					const badBlock = new Block({
						timestamp,
						lastHash,
						hash,
						nonce,
						difficulty,
						data,
					});

					blockchain.chain.push(badBlock);
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});
		});
	});

	describe("replaceChain()", () => {
		let logMock: any;

		beforeEach(() => {
			logMock = jest.fn();

			global.console.log = logMock;
		});

		describe("when the new chain is not longer", () => {
			beforeEach(() => {
				newChain.chain[0] = new Block({
					timestamp: 1,
					lastHash: "foo",
					hash: "bar",
					nonce: 0,
					difficulty: 3,
					data: [],
				});
				blockchain.replaceChain(newChain.chain);
			});

			it("does not replace the chain", () => {
				expect(blockchain.chain).toEqual(originalChain);
			});

			it("logs an error", () => {
				expect(errorMock).toHaveBeenCalled();
			});
		});

		describe("when the new chain is longer", () => {
			beforeEach(() => {
				newChain.addBlock({ data: "Bears" });
				newChain.addBlock({ data: "Beets" });
				newChain.addBlock({ data: "Battlestar Galactica" });
			});

			describe("when the chain is invalid", () => {
				beforeEach(() => {
					newChain.chain[2].hash = "some-fake-hash";

					blockchain.replaceChain(newChain.chain);
				});

				it("does not replace the chain", () => {
					expect(blockchain.chain).toEqual(originalChain);
				});

				it("logs an error", () => {
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe("when the chain is valid", () => {
				beforeEach(() => {
					blockchain.replaceChain(newChain.chain);
				});

				it("replaces the chain", () => {
					expect(blockchain.chain).toEqual(newChain.chain);
				});

				it("logs about the chain replacement", () => {
					expect(logMock).toHaveBeenCalled();
				});
			});
		});
	});

	describe("validTransactionData()", () => {
		let transaction: Transaction,
			rewardTransaction: Transaction,
			wallet: Wallet;

		beforeEach(() => {
			wallet = new Wallet();
			transaction = wallet.createTransaction({
				recipient: "foo-address",
				amount: 65,
			});
			rewardTransaction = Transaction.rewardTransaction({
				minerWallet: wallet,
			});
		});

		describe("and the transaction data is valid", () => {
			it("returns true", () => {
				newChain.addBlock({ data: [transaction, rewardTransaction] });
				expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
					true
				);
				expect(errorMock).not.toHaveBeenCalled();
			});
		});

		describe("and the transaction data has multiple rewards", () => {
			it("returns false and logs an error", () => {
				newChain.addBlock({
					data: [transaction, rewardTransaction, rewardTransaction],
				});
				expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
					false
				);
				expect(errorMock).toHaveBeenCalled();
			});
		});

		describe("and the transaction data has at least one malformed outputMap", () => {
			describe("and the transaction is not a reward transaction", () => {
				it("returns false and logs an error", () => {
					transaction.outputMap[wallet.publicKey] = 999999;
					newChain.addBlock({ data: [transaction, rewardTransaction] });
					expect(
						blockchain.validTransactionData({ chain: newChain.chain })
					).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});
			describe("and the transaction is a reward transaction", () => {
				it("returns false and logs an error", () => {
					rewardTransaction.outputMap[wallet.publicKey] = 999999;
					newChain.addBlock({ data: [transaction, rewardTransaction] });
					expect(
						blockchain.validTransactionData({ chain: newChain.chain })
					).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});
		});

		describe("and the transaction data has at least one malformed input", () => {
			it("returns false and logs an error", () => {
				wallet.balance = 9000;
				const evilOutpuMap = {
					[wallet.publicKey]: 8900,
					fooRecipient: 100,
				};

				const evilTransaction = new Transaction({
					id: "123",
					input: {
						timestamp: Date.now(),
						amount: wallet.balance,
						address: wallet.publicKey,
						signature: <EC.Signature>wallet.sign(evilOutpuMap),
					},
					outputMap: evilOutpuMap,
				});

				newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

				expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
					false
				);
				expect(errorMock).toHaveBeenCalled();
			});
		});

		describe("and a block contains multiple identical transactions", () => {
			it("returns false and logs an error", () => {
				newChain.addBlock({
					data: [transaction, transaction, transaction, rewardTransaction],
				});

				expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
					false
				);
				expect(errorMock).toHaveBeenCalled();
			});
		});
	});
});
