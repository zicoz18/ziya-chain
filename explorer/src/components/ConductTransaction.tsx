import axios from "axios";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ENDPOINTS from "../constants/Endpoints";

const ConductTransaction = () => {
	const navigate = useNavigate();
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState<number>();

	const updateRecipient = (e: any) => {
		setRecipient(e.target.value);
	};
	const updateAmount = (e: any) => {
		setAmount(Number(e.target.value));
	};

	const conductTransaction = async () => {
		const res = await axios.post(ENDPOINTS.TRANSACT, {
			recipient,
			amount,
		});

		alert(res.data.type);
		navigate("/transaction-pool");
	};

	return (
		<div className="ConductTransaction">
			<Link to="/">Home</Link>
			<h3>Conduct a transaction</h3>
			<Form.Group className="transactionForm">
				<Form.Control
					type="text"
					placeholder="recipient"
					value={recipient}
					onChange={updateRecipient}
				/>
			</Form.Group>
			<Form.Group className="transactionForm">
				<Form.Control
					type="number"
					placeholder="amount"
					value={amount}
					onChange={updateAmount}
				/>
			</Form.Group>
			<Button variant="danger" onClick={conductTransaction}>
				Condact Transaction
			</Button>
		</div>
	);
};

export default ConductTransaction;
