import axios from "axios";
import { useEffect, useState } from "react";
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
			<h3>Blocks</h3>
			{blocks.map((block, index) => (
				<Block
					timestamp={block.timestamp}
					hash={block.hash}
					data={block.data}
				/>
			))}
		</div>
	);
};

export default Blocks;
