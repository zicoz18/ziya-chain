import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ENDPOINTS from "../constants/Endpoints";
import POOL_INTERVAL_MS from "../constants/PoolInterval";
import Transaction from "./Transaction";

const TransactionPool = () => {
	const navigate = useNavigate();
	const [transactionPoolMap, setTransactionPoolMap] = useState<any>();

	const getTransactionPoolMap = async () => {
		const recievedTransactionPoolMap = (
			await axios.get(ENDPOINTS.GET_TRANSACTION_POOL_MAP)
		).data;
		setTransactionPoolMap(recievedTransactionPoolMap);
	};

	useEffect(() => {
		getTransactionPoolMap();
		const poolTransactionPoolMap = setInterval(() => {
			getTransactionPoolMap();
		}, POOL_INTERVAL_MS);
		return () => {
			clearInterval(poolTransactionPoolMap);
		};
	}, []);

	const mineTransactions = async () => {
		const recievedStatus = await axios.get(ENDPOINTS.MINE_TRANSACTIONS);
		if (recievedStatus.status === 200) {
			alert("success");
			navigate("/blocks");
		} else {
			alert("The mine-transactions block request did not complete.");
		}
	};

	return (
		<div className="TransactionPool">
			<div>
				<Link to="/">Home</Link>
			</div>
			<h3>Transaction Pool</h3>
			{transactionPoolMap ? (
				Object.values(transactionPoolMap).map((transaction: any) => (
					<div key={transaction.id}>
						<hr />
						<Transaction transaction={transaction} />
					</div>
				))
			) : (
				<div>
					<hr />
					<div>Loading...</div>
				</div>
			)}
			<hr />
			<Button variant="danger" onClick={mineTransactions}>
				Mine the Transactions
			</Button>
		</div>
	);
};

export default TransactionPool;
