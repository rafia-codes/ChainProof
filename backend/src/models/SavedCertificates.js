import mongoose, { model } from 'mongoose';

const savedCertificatesSchema = new mongoose.Schema({
    certificateId:{
        type: String,
        required: true
    },
    viewerWallet:{
        type: String,
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now()
    }
});

export const SavedCertificate = model("SavedCertificate",savedCertificatesSchema);