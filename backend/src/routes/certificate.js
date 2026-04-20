import { Issuer } from '../models/Issuer';
import { verifySignature } from '../utils/verifySignature';
import { issue,verify,revoke } from '../services/service';

function certificateRouter(fastify,opts) {
    fastify.post('/issue', async (request, reply) => {
    const certificateId = request.body.certificateID;
    const file = await request.file();
    const { message, signature } = request.body;

    if (!message || !signature)
        return reply.code(403).send({ message: "Signature required" });

    const wallet = verifySignature(message, signature);

    if (!wallet)
        return reply.code(403).send({ message: "Invalid signature" });

    const status = await issuerStatus(wallet);

    if (!status.success || !status.approved)
        return reply.code(403).send({ message: "Not an approved issuer" });

    const res = await issue({ wallet, certificateId, file });
    return reply.send(res);
    });

    fastify.get('/verify/:certificateID',async (request,reply)=>{
        const certificateId = request.params.certificateID;
        //const file = await request.file();
        const cert = await verify({certificateId});
        return reply.send(cert);
    });

    fastify.post('/revoke', async (request, reply) => {
    const { certificateID, message, signature } = request.body;

    const wallet = verifySignature(message, signature);

    if (!wallet)
        return reply.code(403).send({ message: "Invalid signature" });

    const res = await revoke({ certificateId: certificateID });

    if (!res.success)
        return reply.code(400).send({ message: "Revoke failed" });

    return reply.send({
        message: "Certificate revoked",
        txnHash: res.txnHash
    });
    });
}

export default certificateRouter;