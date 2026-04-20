import { ethers } from "ethers";

export const verifySignature = (message, signature) => {
    try {
        const address = ethers.verifyMessage(message, signature);
        return address;
    } catch (error) {
        return null;
    }
};