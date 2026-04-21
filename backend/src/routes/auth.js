import { Nonce } from '../models/Nonce';
import crypto from 'node:crypto';

function authRouter(fastify,opts){
    fastify.post('/nonce',async(request,reply)=>{
        const {wallet} = request.body;

        if(!wallet)
            return reply.code(403).send({message:"Wallet required."});

        const nonce = crypto.randomBytes(16).toString('hex');

        await Nonce.findOneAndUpdate({
            wallet,
            nonce,
            used: false,
        },{
            upsert: true
        });

        return reply.send({nonce});
    })
}

export default authRouter;