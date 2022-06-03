import crypto from "crypto";

const cryptoHash = (...inputs: any[]) => {
	const hash = crypto.createHash("sha256");
	const hashOutput = hash.update(inputs.sort().join(" ")).digest("hex");
	return hashOutput;
};

export default cryptoHash;
