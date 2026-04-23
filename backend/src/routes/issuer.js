import { Issuer } from "../models/Issuer";
import { approve, unapprove, status } from "../services/service";

function issuerRouter(fastify, opts) {
  fastify.get("/status/:wallet", async (request, reply) => {
    const wallet = request.params.wallet;
    const res = await service.status({ walletAddress: wallet });
    reply.send(res);
  });

  fastify.post("/request", async (request, reply) => {
    const { wallet, name } = request.body;
    if (!wallet || !name)
      return reply.code(400).send({ message: "Wallet and name required" });
    const existing = await Issuer.findOne({ wallet });
    if (existing) return reply.send({ message: "Already requested" });
    const issuer = await Issuer.create({ wallet,name });
    return reply.send({ message: "Request submitted", issuer });
  });

  fastify.post("/approve", async (request, reply) => {
    const wallet = request.body.wallet;
    const res = await service.approve({ walletAddress: wallet });
    if (!res?.success)
      return reply.send({ message: "Blockchain approval failed" });
    const issuer = await Issuer.findOne({ wallet });
    if (!issuer) return reply.send({ message: "Issuer not found in DB" });
    issuer.approved = true;
    await issuer.save();
    return reply.send({ message: "Issuer approved" });
  });

  fastify.post("/unapprove", async (request, reply) => {
    const wallet = request.body.wallet;
    const res = await service.unapprove({ walletAddress: wallet });
    if (!res?.success)
      return reply.send({ message: "Blockchain unapprove failed" });
    const issuer = await Issuer.findOne({ wallet });
    if (!issuer) return reply.send({ message: "Issuer not found" });
    issuer.approved = false;
    await issuer.save();
    return reply.send({ message: "Issuer unapproved" });
  });
}

export default issuerRouter;
