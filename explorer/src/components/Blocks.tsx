import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ENDPOINTS from "../constants/Endpoints";
import { IBlock } from "../interfaces";
import Block from "./Block";

const Blocks = () => {
	const [blocks, setBlocks] = useState<IBlock[]>([]);
	const [paginatedId, setPaginatedId] = useState<number>(1);
	const [blocksLength, setBlocksLength] = useState<number>(0);

	const getPaginatedBlocks = async (paginatedId: number) => {
		const recievedBlocks = (
			await axios.get(`${ENDPOINTS.GET_BLOCKS}/${paginatedId}`)
		).data;
		setBlocks(recievedBlocks);
	};

	const getBlocksLength = async () => {
		const recievedBlocksLength = (
			await axios.get(`${ENDPOINTS.GET_BLOCKS}/length`)
		).data;
		setBlocksLength(recievedBlocksLength);
	};

	useEffect(() => {
		getBlocksLength();
		getPaginatedBlocks(paginatedId);
	}, []);

	return (
		<div>
			<div>
				<Link to="/">Home</Link>
			</div>
			<h3>Blocks</h3>
			<div>
				{/* {[...Array(Math.ceil(blocksLength / 5)).keys()].map((key) => { */}
				{[...Array(Math.ceil(blocksLength / 5)).keys()].map((key) => {
					const paginatedId = key + 1;

					return (
						<span key={key} onClick={() => getPaginatedBlocks(paginatedId)}>
							<Button size="sm" variant="danger">
								{paginatedId}
							</Button>{" "}
						</span>
					);
				})}
			</div>
			{blocks.map((block, index) => (
				<Block key={block.hash} block={block} />
			))}
		</div>
	);
};

export default Blocks;
