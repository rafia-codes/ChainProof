import { verifySignature } from '../utils/verifySignature';
import { issue,verify,revoke,status } from '../services/service';

function certificateRouter(fastify,opts) {


    fastify.post('/issue', async (request, reply) => {
    const certificateId = request.body.certificateID;
    const file = await request.file();
    const { wallet, signature, nonce } = request.body;

    if (!wallet || !signature || !nonce)
        return reply.code(403).send({ message: "Auth required" });

    const verifiedWallet = await verifySignature(wallet,signature,nonce);

    if (!verifiedWallet)
        return reply.code(403).send({ message: "Invalid signature" });

    const issuerCheck = await status(verifiedWallet);

    if (!issuerCheck.success || !issuerCheck.approved)
        return reply.code(403).send({ message: "Not an approved issuer" });

    const res = await issue({ wallet:verifiedWallet, certificateId, file });
    return reply.send(res);
    });



    fastify.get('/verify/:certificateID',async (request,reply)=>{
        const certificateId = request.params.certificateID;
        //const file = await request.file();
        const cert = await verify({certificateId});
        return reply.send(cert);
    });




    fastify.post('/revoke', async (request, reply) => {
    const { certificateID, wallet, signature, nonce } = request.body;

    if (!wallet || !signature || !nonce || !certificateID)
        return reply.code(403).send({ message: "Auth required" });

    const verifiedWallet = await verifySignature(wallet, signature, nonce);

    if (!verifiedWallet)
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