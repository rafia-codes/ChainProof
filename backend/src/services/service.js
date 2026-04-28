import crypto from "node:crypto";
import { PinataSDK } from "pinata";
import {
  approveIssuer,
  getCertificateFromChain,
  issuerStatus,
  unapproveIssuer,
} from "./blockchain.js";
import axios from "axios";
import FormData from "form-data";
import { Issuer } from "../models/Issuer.js";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export const issue = async ({
  wallet,
  certificateId,
  fileBuffer,
  fileMeta,
  student_name,
}) => {
  try {
    console.log("ISSUE FUNCTION CALLED");
    const issuer = await Issuer.findOne({ wallet });
    console.log("sline 15");
    //ocr-check
    const formData = new FormData();
    console.log("sline 19");
    formData.append("file", fileBuffer, {
      filename: file.filename,
      contentType: file.mimetype,
    });
    formData.append("student_name", student_name);
    formData.append("issuer_org", issuer.name);
    console.log("sline 26");
    const ocrResponse = await axios.post(
      `${process.env.OCR_SERVICE_URL}/validate`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );
    if (!ocrResponse.data.valid) {
      return {
        success: false,
        reason: "Certificate validation failed",
        mismatches: ocrResponse.data.mismatches,
      };
    }
    console.log("sline 37");
    //generate hash
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    //upload on ipfs -> get cid

    const upload = await pinata.upload.public.file(fileBuffer);
    const cid = upload.cid;
    console.log(cid);
    console.log("sline 46");
    //store on blockchain on frontend
    //const { txnHash } = await issueOnChain(certificateId,"0x"+hash,cid);

    return { success: true, hash, cid };
  } catch (error) {
    console.error("ISSUE FUNCTION ERROR:", err);
    return { success: false, error: err.message };
  }
};

export const verify = async ({ certificateId }) => {
  if (!certificateId) return null;
  const cert = await getCertificateFromChain(certificateId);
  if (!cert) return null;

  return {
    ...cert,
    isRevoked: cert.isRevoked,
  };
};

export const approve = async ({ walletAddress }) => {
  if (!walletAddress) return "Connect your wallet first and sign a message";

  const res = await approveIssuer(walletAddress);
  return res;
};

export const unapprove = async ({ walletAddress }) => {
  if (!walletAddress) return "Connect your wallet first and sign a message";

  const res = await unapproveIssuer(walletAddress);
  return res;
};

export const status = async ({ walletAddress }) => {
  if (!walletAddress) return "Connect your wallet first and sign a message";

  const res = await issuerStatus(walletAddress);
  return res;
};
