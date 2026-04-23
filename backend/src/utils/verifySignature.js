import { ethers } from "ethers";
import { Nonce } from "../models/Nonce";

export const verifySignature =async ( signature, nonce) => {
    try {
        const message = `Verify identity: ${nonce}`;
        const recovered = ethers.verifyMessage(message, signature);

        const record = await Nonce.findOne({wallet:recovered});

        if(!record || record.nonce != nonce || record.used)
            return null;

        record.used = true;
        await record.save();

        return recovered;
    } catch (error) {
        return null;
    }
};