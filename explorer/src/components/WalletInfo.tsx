import { useEffect, useState } from "react";
import axios from "axios";
import ENDPOINTS from "../constants/Endpoints";
import { IWalletInfo } from "../interfaces";
import { Link } from "react-router-dom";
const Logo = require("../assets/logo.png");

const WalletInfo = () => {
	const [walletInfo, setWalletInfo] = useState<IWalletInfo>({
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
			<img className="logo" src={Logo} alt="" />
			<br />
			<div>Welcome to Ziya Chain Explorer</div>
			<br />
			<Link to="/blocks">Blocks</Link>
			<Link to="/conduct-transaction">Conduct a Transaction</Link>
			<Link to="/transaction-pool">Transaction Pool</Link>
			<br />
			<div className="WalletInfo">
				<div>Address: {walletInfo.address}</div>
				<div>Balance: {walletInfo.balance}</div>
			</div>
		</div>
	);
};

export default WalletInfo;
