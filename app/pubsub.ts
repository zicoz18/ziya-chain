import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { plainToInstance } from "class-transformer";

import Blockchain from "../blockchain";
import Transaction from "../wallet/transaction";
import TransactionPool from "../wallet/transaction-pool";

interface CreatePubSubAttributes {
	blockchain: Blockchain;
	transactionPool: TransactionPool;
}
interface PublishAttributes {
	channel: string;
	message: string;
}

const CHANNELS = {
	TEST: "TEST",
	BLOCKCHAIN: "BLOCKCHAIN",
	TRANSACTION: "TRANSACTION",
};

// Should not use new Pubsub() to create a new instance
// Have to use await PubSub.create() to create a new instance because we use async code inside constructor
class PubSub {
	public blockchain: Blockchain;
	public transactionPool: TransactionPool;
	public publisher: RedisClientType;
	public subscriber: RedisClientType;

	// Custom constructor because we have to use async code inside contrustor
	public static async create({
		blockchain,
		transactionPool,
	}: CreatePubSubAttributes): Promise<PubSub> {
		const pubSub = new PubSub({ blockchain, transactionPool });
		await pubSub.connect();
		return pubSub;
	}

	constructor({ blockchain, transactionPool }: CreatePubSubAttributes) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.publisher = createClient();
		this.subscriber = createClient();

		this.subscribeToChannels();
	}

	async connect(): Promise<void> {
		await this.publisher.connect();
		await this.subscriber.connect();
	}

	handleMessage(message: string, channel: string): void {
		console.log(`Message received. Channel: ${channel}.\nMessage: ${message}`);
		const parsedMessage = JSON.parse(message);

		switch (channel) {
			case CHANNELS.BLOCKCHAIN:
				this.blockchain.replaceChain(parsedMessage);
				break;
			case CHANNELS.TRANSACTION:
				const newlyCreatedTransaction = new Transaction({
					id: parsedMessage.id,
					outputMap: parsedMessage.outputMap,
					input: parsedMessage.input,
				});
				this.transactionPool.setTransaction(newlyCreatedTransaction);
				break;
			default:
				return;
		}
	}

	subscribeToChannels(): void {
		Object.values(CHANNELS).forEach((channel) => {
			// Different version of redis might have to change
			this.subscriber.subscribe(channel, (message: any, channel: any) =>
				this.handleMessage(message, channel)
			);
		});
	}

	publish({ channel, message }: PublishAttributes): void {
		this.publisher.publish(channel, message);
	}

	broadcastChain(): void {
		this.publish({
			channel: CHANNELS.BLOCKCHAIN,
			message: JSON.stringify(this.blockchain.chain),
		});
	}

	broadcastTransaction(transaction: Transaction): void {
		this.publish({
			channel: CHANNELS.TRANSACTION,
			message: JSON.stringify(transaction),
		});
	}
}

export default PubSub;
