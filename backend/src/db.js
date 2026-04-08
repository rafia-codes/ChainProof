import mongoose from 'mongoose';
import 'dotenv/config';

async function connect(){
    try {
       await mongoose.connect(process.env.DB_URL);
       console.log("DB connected");
    } catch (error) {
        console.log(error);
    }
}

connect();