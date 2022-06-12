import { useState } from "react";
import { Button } from "react-bootstrap";
import { IBlockProps } from "../interfaces";
import Transaction from "./Transaction";

const Block = ({ block }: IBlockProps) => {
	const { data, timestamp, hash } = block;
	const [displayTransaction, setDisplayTransaction] = useState(false);

	const toggleTransaction = () => {
		setDisplayTransaction(!displayTransaction);
	};

	const renderTransaction = () => {
		const stringifiedData = JSON.stringify(data);
		const dataDisplay =
			stringifiedData.length > 35
				? `${stringifiedData.substring(0, 35)}...`
				: stringifiedData;

		return displayTransaction ? (
			<div>
				{data.map((transaction) => (
					<div key={transaction.id}>
						<hr />
						<Transaction transaction={transaction} />
					</div>
				))}
				<br />
				<Button variant="danger" size="sm" onClick={toggleTransaction}>
					Show Less
				</Button>
			</div>
		) : (
			<div>
				<div>Data: {dataDisplay}</div>
				<Button variant="danger" size="sm" onClick={toggleTransaction}>
					Show More
				</Button>
			</div>
		);
	};

	const hashDisplay = `${hash.substring(0, 15)}...`;

	return (
		<div className="Block">
			<div>Hash: {hashDisplay}</div>
			<div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
			{renderTransaction()}
		</div>
	);
};

export default Block;
