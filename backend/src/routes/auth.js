import { Nonce } from "../models/Nonce.js";
import crypto from "node:crypto";

function authRouter(fastify, opts) {
  fastify.post("/nonce", async (request, reply) => {
    const { wallet } = request.body;

    if (!wallet) return reply.code(403).send({ message: "Wallet required." });

    const nonce = crypto.randomBytes(16).toString("hex");

    await Nonce.deleteMany({wallet});
    await Nonce.create({
      wallet,
      nonce,
    });

    return reply.send({ nonce });
  });
}

export default authRouter;