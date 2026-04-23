import { Contract, ethers } from 'ethers';
import 'dotenv/config';


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY,provider);//will take from user itself only

const abi = [
    "function approveIssuer(address issuer) public",
    "function unapproveIssuer(address issuer) public",
    "function issuerStatus(address issuer) public view returns(bool)",
    "function getCertificate(string calldata certificateId) public view returns (Certificate memory)",
];

const contract = new Contract(process.env.CONTRACT_ADDRESS,abi,wallet);

export const getCertificateFromChain = async(certificateId) => {
    try {
       const cert = await contract.getCertificate(certificateId);
       return {
        certificateId: cert.certificateId,
        hash: cert.hash,
        issuer: cert.issuer,
        cid: cert.cid,
        timestamp: cert.timestamp
       }
    } catch (error) {
        return null;
    }
}

export const approveIssuer = async(walletAddress) => {
    try {
        const txn = await contract.approveIssuer(walletAddress);
        await txn.wait();
        return {success: true};
    } catch (error) {
        console.log(error);
        return { success: false};
    }
}

export const unapproveIssuer = async(walletAddress) => {
    try {
        const txn = await contract.unapproveIssuer(walletAddress);
        await txn.wait();
        return {success: true};
    } catch (error) {
        console.log(error);
        return { success: false};
    }
}

export const issuerStatus = async (walletAddress) => {
    try {
        const status = await contract.issuerStatus(walletAddress);
        return { success: true, approved: status };
    } catch (error) {
        console.log(error);
        return { success: false };
    }
}