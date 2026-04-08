import { Issuer } from '../models/Issuer';
import service from '../services/service';

function certificateRouter(fastify,opts) {
    fastify.post('/issue',async(request,reply)=>{
        const certificateId = request.body.certificateID;
        const wallet = request.body.wallet;
        const file = await request.file();

        if(!wallet)
            return reply.code(403).send({message:"Please connect your wallet."});

        const issuer = await Issuer.findOne({wallet});
        if(!issuer)
            return reply.code(403).send({message:"Only issuers can issue."});

        if(!issuer.approved)
            return reply.code(403).send({message:"Only approved issuers can issue."});

        const res = await service.issue({wallet,certificateId,file});
        return reply.send(res);
    });

    fastify.get('/verify/:certificateID',async (request,reply)=>{
        const certificateId = request.params.certificateID;
        //const file = await request.file();
        const cert = await service.verify({certificateId});
        return reply.send(cert);
    })
}

export default certificateRouter;
