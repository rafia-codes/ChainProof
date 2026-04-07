import service from '../services/service';

function certificateRouter(fastify,opts) {
    fastify.post('/issue',async(request,reply)=>{
        const certificateId = request.body.certificateID;
        const wallet = request.body.wallet;
        const file = await request.file();

        const res = await service.issue({wallet,certificateId,file});
        reply.send(res);
    });

    fastify.get('/verify/:certificateID',async (request,reply)=>{
        const certificateId = request.params.certificateID;
        const file = await request.file();
        const cert = await service.verify({certificateId,file});
    })
}

export default certificateRouter;
