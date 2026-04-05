import service from '../services/service';

function certificateRouter(fastify,opts) {
    fastify.post('/issue',async(request,reply)=>{
        const certificateId = request.body.certificateID;
        const wallet = request.body.wallet;
        const file = await request.file();

        const res = await service.issue({wallet,certificateId,file});
        reply.send(res);
    });

    fastify.get('/verify/:certificateID',(request,reply)=>{
        const certificateId = request.params['certificateID'];

    })
}

export default certificateRouter;
