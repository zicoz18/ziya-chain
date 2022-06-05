import { ec as EC } from "elliptic";
import cryptoHash from "./crypto-hash";

interface VerifySignatureAttributes {
	publicKey: string;
	data: any;
	signature: EC.Signature;
}

const ec = new EC("secp256k1");

const verifySignature = ({
	publicKey,
	data,
	signature,
}: VerifySignatureAttributes): boolean => {
	const keyFromPublic: EC.KeyPair = ec.keyFromPublic(publicKey, "hex");

	return keyFromPublic.verify(cryptoHash(data), signature);
};

export { ec, verifySignature, cryptoHash };
