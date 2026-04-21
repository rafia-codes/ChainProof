import mongoose from "mongoose";

const nonceSchema = new mongoose.Schema({
    wallet: String,
    nonce: String,
    used: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // auto delete in 5 min
    }
});

export const Nonce = mongoose.model("Nonce", nonceSchema);