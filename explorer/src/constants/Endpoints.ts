const BASE_URL = document.location.origin;
const BASE_API_URL = `${BASE_URL}/api/`;

const ENDPOINTS = {
	GET_BLOCKS: `${BASE_API_URL}blocks`,
	GET_WALLET_INFO: `${BASE_API_URL}wallet-info`,
	GET_TRANSACTION_POOL_MAP: `${BASE_API_URL}transaction-pool-map`,
	GET_KNOWN_ADDRESSES: `${BASE_API_URL}known-addresses`,
	TRANSACT: `${BASE_API_URL}transact`,
	MINE_TRANSACTIONS: `${BASE_API_URL}mine-transactions`,
};

export default ENDPOINTS;
