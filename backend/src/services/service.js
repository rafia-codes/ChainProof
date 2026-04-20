import crypto from 'node:crypto';
import { PinataSDK } from 'pinata';
import { approveIssuer, getCertificateFromChain, issueOnChain, issuerStatus, unapproveIssuer, revokeOnChain } from './blockchain';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY
});

export const issue = async({wallet,certificateId,file}) => {
//generate hash

const fileBuffer = await file.toBuffer();
const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

//upload on ipfs -> get cid

const upload = await pinata.upload.public.file(fileBuffer);
const cid = upload.cid;
console.log(cid);

//store on blockchain

const { txnHash } = await issueOnChain(certificateId,"0x"+hash,cid);

return {hash,cid,txnHash};

};


export const verify = async ({ certificateId }) => {
    if (!certificateId)
        return null;
    const cert = await getCertificateFromChain(certificateId);
    if (!cert)
        return null;

    return {
        ...cert,
        isRevoked: cert.isRevoked
    };
};

export const revoke = async ({ certificateId }) => {
    if (!certificateId)
        return { success: false };

    const res = await revokeOnChain(certificateId);
    return res;
};


export const  approve = async({walletAddress}) => {
    if(!walletAddress)
        return "Connect your wallet first and sign a message";

    const res = await approveIssuer(walletAddress); 
    return res;
}

export const  unapprove = async({walletAddress}) => {
    if(!walletAddress)
        return "Connect your wallet first and sign a message";

    const res = await unapproveIssuer(walletAddress); 
    return res;
}

export const  status = async({walletAddress}) => {
    if(!walletAddress)
        return "Connect your wallet first and sign a message";

    const res = await issuerStatus(walletAddress); 
    return res;
}