import { Issuer } from "../models/Issuer.js";
import { approve, unapprove, status } from "../services/service.js";

function issuerRouter(fastify, opts) {
  fastify.get("/status/:wallet", async (request, reply) => {
    const wallet = request.params.wallet;
    const res = await status({ walletAddress: wallet });
    reply.send(res);
  });

  fastify.post("/request", async (request, reply) => {
    const { wallet, name } = request.body;
    if (!wallet || !name)
      return reply.code(400).send({ message: "Wallet and name required" });
    const existing = await Issuer.findOne({ wallet });
    if (existing) return reply.send({ message: "Already requested" });
    const issuer = await Issuer.create({ wallet, name });
    return reply.send({ message: "Request submitted", issuer });
  });

  fastify.post("/approve", async (request, reply) => {
    const wallet = request.body.wallet;
    const res = await approve({ walletAddress: wallet });
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
    const res = await unapprove({ walletAddress: wallet });
    if (!res?.success)
      return reply.send({ message: "Blockchain unapprove failed" });
    const issuer = await Issuer.findOne({ wallet });
    if (!issuer) return reply.send({ message: "Issuer not found" });
    issuer.approved = false;
    await issuer.save();
    return reply.send({ message: "Issuer unapproved" });
  });

  fastify.get("/pending", async (request, reply) => {
    console.log('hitting');
    const pending = await Issuer.find({ approved: false });
    return reply.send(pending);
  });

  fastify.get("/approved", async (request, reply) => {
    console.log('hitting');
    const approved = await Issuer.find({ approved: true });
    return reply.send(approved);
  });

  fastify.get("/check/:wallet", async (request, reply) => {
    const wallet = request.params.wallet;
    const issuer = await Issuer.findOne({ wallet });
    return reply.send({ exists: !!issuer });
  });
}

export default issuerRouter;
