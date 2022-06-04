import { RedisClientType } from "@redis/client";
import { createClient } from "redis";

const CHANNELS = {
	TEST: "TEST",
};

class PubSub {
	public publisher: RedisClientType;
	public subscriber: RedisClientType;

	constructor() {
		this.publisher = createClient();
		this.subscriber = createClient();

		this.subscriber.subscribe(CHANNELS.TEST, this.handleMessage);
	}

	handleMessage(message: any, channel: any) {
		console.log(`Message received. Channel: ${channel}. Message: ${message}`);
	}

	async connect() {
		await this.publisher.connect();
		await this.subscriber.connect();
	}
}

const main = async () => {
	const pubSub = new PubSub();
	await pubSub.connect();
	pubSub.publisher.publish(CHANNELS.TEST, "Hello World!");
};
main();
