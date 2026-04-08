import mongoose from 'mongoose';

const issuerSchema = new mongoose.Schema({
    wallet:{
        type: String,
        required: true,
        unique: true
    },
    approved:{
        type: Boolean,
        default: false
    }
});

export const Issuer = mongoose.model("Issuer",issuerSchema);