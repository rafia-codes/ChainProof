import crypto from 'node:crypto';
import { PinataSDK } from 'pinata';
import { approveIssuer, getCertificateFromChain, issuerStatus, unapproveIssuer } from './blockchain';
import axios from "axios";
import FormData from "form-data";
import Issuer from '../models/Issuer';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY
});

export const issue = async({wallet,certificateId,file,student_name}) => {
const issuer = await Issuer.findOne({wallet});

//ocr-check
const fileBuffer = await file.toBuffer();
const formData = new FormData();

formData.append("file",fileBuffer,{
    filename: file.filename,
    contentType: file.mimetype
});
formData.append("student_name",student_name);
formData.append("issuer_org",issuer.name);

const ocrResponse = await axios.post(`${process.env.OCR_SERVICE_URL}/validate`,formData,{
    headers: formData.getHeaders()
});
if (!ocrResponse.data.valid) {
    return {
        success: false,
        reason: "Certificate validation failed",
        mismatches: ocrResponse.data.mismatches
    };
}

//generate hash
const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

//upload on ipfs -> get cid

const upload = await pinata.upload.public.file(fileBuffer);
const cid = upload.cid;
console.log(cid);

//store on blockchain on frontend
//const { txnHash } = await issueOnChain(certificateId,"0x"+hash,cid);

return {success:true,hash,cid};

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