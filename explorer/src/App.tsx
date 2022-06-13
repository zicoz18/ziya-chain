import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import TransactionPool from "./components/TransactionPool";
import WalletInfo from "./components/WalletInfo";

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<WalletInfo />} />
				<Route path="/blocks" element={<Blocks />} />
				<Route path="/conduct-transaction" element={<ConductTransaction />} />
				<Route path="/transaction-pool" element={<TransactionPool />} />
			</Routes>
		</Router>
	);
};

export default App;
