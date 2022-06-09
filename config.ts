const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
	timestamp: 1,
	lastHash: "-----",
	hash: "hash-one",
	difficulty: INITIAL_DIFFICULTY,
	nonce: 0,
	data: [],
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = <
	{
		timestamp: number;
		amount: number;
		address: string;
		signature: any;
	}
>{
	timestamp: 0,
	amount: 0,
	address: "*authorized-reward*",
	signature: {
		r: "0",
		s: "0",
		recoveryParam: 0,
	},
};

const MINING_REWARD = 50;

export {
	GENESIS_DATA,
	MINE_RATE,
	STARTING_BALANCE,
	REWARD_INPUT,
	MINING_REWARD,
};
