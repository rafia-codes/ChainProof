import { ethers } from "ethers";
import { Nonce } from "../models/Nonce.js";

export const verifySignature = async (signature, nonce) => {
  try {
    console.log("Inside verify signature");
    console.log("RAW signature:", signature);
    console.log("TYPE:", typeof signature);
    console.log("LENGTH:", signature?.length);
    const message = `Verify identity: ${nonce}`;
    const recovered = ethers.verifyMessage(message, signature);
    console.log(recovered + "line 8");
    const record = await Nonce.findOne({ wallet: recovered });
    console.log(record + "line 10");
    console.log('line15');
    if (!record) return null;
    console.log('line17');
    if (String(record.nonce) !== String(nonce)) {
      console.log("Nonce mismatch");
      return null;
    }
    console.log('line22');
    if (record.used) {
      console.log("Nonce already used");
      return null;
    }
    console.log('line27');
    await Nonce.updateOne(
      { wallet: recovered },
      { $set: { used: true } }
    );
    console.log('line 32');
    return recovered;
  } catch (error) {
    console.error("verifySignature error:", error);
    return null;
  }
};
