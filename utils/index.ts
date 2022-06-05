import { ec as ES } from "elliptic";
import cryptoHash from "./crypto-hash";

const ec = new ES("secp256k1");

const verifySignature = ({ publicKey, data, signature }: any) => {
	const keyFromPublic = ec.keyFromPublic(publicKey, "hex");

	return keyFromPublic.verify(cryptoHash(data), signature);
};

export { ec, verifySignature };
