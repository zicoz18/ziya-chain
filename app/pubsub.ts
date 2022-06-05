import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import Blockchain from "../blockchain";

const CHANNELS = {
	TEST: "TEST",
	BLOCKCHAIN: "BLOCKCHAIN",
};

// Should not use new Pubsub() to create a new instance
// Have to use await PubSub.create() to create a new instance because we use async code inside constructor
class PubSub {
	public blockchain: Blockchain;
	public publisher: RedisClientType;
	public subscriber: RedisClientType;

	// Custom constructor because we have to use async code inside contrustor
	public static async create({ blockchain }: any): Promise<PubSub> {
		const pubSub = new PubSub({ blockchain });
		await pubSub.connect();
		return pubSub;
	}

	constructor({ blockchain }: any) {
		this.blockchain = blockchain;
		this.publisher = createClient();
		this.subscriber = createClient();

		this.subscribeToChannels();
	}

	async connect() {
		await this.publisher.connect();
		await this.subscriber.connect();
	}

	handleMessage(message: any, channel: any) {
		console.log(`Message received. Channel: ${channel}. Message: ${message}`);
		const parsedMessage = JSON.parse(message);
		// console.log("blockchain bb: ", this.blockchain);

		switch (channel) {
			case CHANNELS.BLOCKCHAIN:
				this.blockchain.replaceChain(parsedMessage);
				break;
			default:
				break;
		}
	}

	subscribeToChannels() {
		Object.values(CHANNELS).forEach((channel) => {
			// Different version of redis might have to change
			this.subscriber.subscribe(channel, (message: any, channel: any) =>
				this.handleMessage(message, channel)
			);
		});
	}

	publish({ channel, message }: any) {
		this.publisher.publish(channel, message);
	}

	broadcastChain() {
		this.publish({
			channel: CHANNELS.BLOCKCHAIN,
			message: JSON.stringify(this.blockchain.chain),
		});
	}
}

export default PubSub;
