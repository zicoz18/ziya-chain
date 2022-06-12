import axios from "axios";
import { useEffect, useState } from "react";
import ENDPOINTS from "../constants/Endpoints";

const Blocks = () => {
	const [blocks, setBlocks] = useState<any[]>([]);

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
				<div key={(block as any).hash}>{(block as any).hash}</div>
			))}
		</div>
	);
};

export default Blocks;
