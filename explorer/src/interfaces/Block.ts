interface Block {
	hash: string;
	previousHash: string;
	timestamp: number;
	nonce: number;
	difficulty: number;
	data: any[];
}

export type { Block };
