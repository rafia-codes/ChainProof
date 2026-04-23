import { verifySignature } from "../utils/verifySignature";
import { issue, verify, status } from "../services/service";

function certificateRouter(fastify, opts) {
  fastify.post("/issue", async (request, reply) => {
    const file = await request.file();

    const certificateId = file.fields.certificateID?.value;
    const student = file.fields.studentname?.value;
    const signature = file.fields.signature?.value;
    const nonce = file.fields.nonce?.value;

    if (!signature || !nonce)
      return reply.code(403).send({ message: "Auth required" });

    const verifiedWallet = await verifySignature(signature, nonce);

    if (!verifiedWallet)
      return reply.code(403).send({ message: "Invalid signature" });
    
    const issuerCheck = await status(verifiedWallet);

    if (!issuerCheck.success || !issuerCheck.approved)
      return reply.code(403).send({ message: "Not an approved issuer" });

    const res = await issue({
      wallet: verifiedWallet,
      certificateId,
      file,
      student_name: student,
    });
    return reply.send(res);
  });

  fastify.get("/verify/:certificateID", async (request, reply) => {
    const certificateId = request.params.certificateID;
    const cert = await verify({ certificateId });
    return reply.send(cert);
  });
}

export default certificateRouter;
