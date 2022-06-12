import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ENDPOINTS from "../constants/Endpoints";
import { IBlock } from "../interfaces";
import Block from "./Block";

const Blocks = () => {
	const [blocks, setBlocks] = useState<IBlock[]>([]);

	const getBlocks = async () => {
		const recievedBlocks = (await axios.get(ENDPOINTS.GET_BLOCKS)).data;
		setBlocks(recievedBlocks);
	};

	useEffect(() => {
		getBlocks();
	}, []);

	return (
		<div>
			<div>
				<Link to="/">Home</Link>
			</div>
			<h3>Blocks</h3>
			{blocks.map((block, index) => (
				<Block block={block} />
			))}
		</div>
	);
};

export default Blocks;
