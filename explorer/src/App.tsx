import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Blocks from "./components/Blocks";
import WalletInfo from "./components/WalletInfo";

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<WalletInfo />} />
				<Route path="/blocks" element={<Blocks />} />
			</Routes>
		</Router>
	);
};

export default App;
