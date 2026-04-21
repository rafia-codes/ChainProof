import { ethers } from "ethers";
import { Nonce } from "../models/Nonce";

export const verifySignature = (wallet, signature, nonce) => {
    try {
        const message = `Verify identity: ${Nonce}`;
        const recovered = ethers.verifyMessage(message, signature);
        
        if(recovered.toLowerCase() !==  wallet.toLowerCase())
            return null;

        const record = await Nonce.findOne({wallet});

        if(!record || record.nonce != nonce || record.used)
            return null;

        record.used = true;
        await record.save();

        return wallet;
    } catch (error) {
        return null;
    }
};