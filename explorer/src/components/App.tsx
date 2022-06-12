import { useEffect, useState } from "react";
import axios from "axios";
import ENDPOINTS from "../constants/Endpoints";
import Blocks from "./Blocks";
import { WalletInfo } from "../interfaces";

const App = () => {
	const [walletInfo, setWalletInfo] = useState<WalletInfo>({
		address: "0",
		balance: -1,
	});

	const getWalletInfo = async () => {
		const recievedWalletInfo = (await axios.get(ENDPOINTS.GET_WALLET_INFO))
			.data;
		setWalletInfo(recievedWalletInfo);
	};

	useEffect(() => {
		getWalletInfo();
	}, []);

	return (
		<div className="App">
			<div>Welcome to Ziya Chain Explorer</div>
			<div>Address: {walletInfo.address}</div>
			<div>Balance: {walletInfo.balance}</div>
			<br />
			<Blocks />
		</div>
	);
};

export default App;
