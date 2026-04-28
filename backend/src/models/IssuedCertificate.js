import { model, Schema } from "mongoose";

const issuedCertificatesSchema = new Schema({
    certificateId: {
        type: String,
        required: true
    },
    issuerWallet: {
        type: String,
        required: true
    },
    txnHash: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        required: Date.now()
    }
});

export const IssuedCertificate = model("IssuedCertificate",issuedCertificatesSchema);