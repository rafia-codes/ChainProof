import crypto from 'node:crypto';
import { PinataSDK } from 'pinata';
import { issueOnChain } from './blockchain';

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


export const  verify = async({certificateId,file}) => {
    
}