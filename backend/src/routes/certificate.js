import { verifySignature } from "../utils/verifySignature.js";
import { verify, status, issue } from "../services/service.js";
import { IssuedCertificate } from "../models/IssuedCertificate.js";
import { SavedCertificate } from "../models/SavedCertificates.js";
import { getCertificateFromChain } from "../services/blockchain.js";

function certificateRouter(fastify, opts) {
  //to issue the certificate
  fastify.post("/issue", async (request, reply) => {
  console.log("hitting");

  const file = await request.file(); // still needed for file stream

  const signature = request.body.signature?.value;
  const nonce = request.body.nonce?.value;
  const certificateId = request.body.certificateID;
  const student = request.body.studentname;

  console.log("signature:", signature);
  console.log("nonce:", nonce);

  if (!signature || !nonce)
    return reply.code(403).send({ message: "Auth required" });
  console.log('passed 1');
  const verifiedWallet = await verifySignature(signature, nonce);

  if (!verifiedWallet)
    return reply.code(403).send({ message: "Invalid signature" });
  console.log('passed 2',verifiedWallet);
  const issuerCheck = await status({walletAddress:verifiedWallet});
  console.log(issuerCheck);
  if (!issuerCheck.success || !issuerCheck.approved)
    return reply.code(403).send({ message: "Not an approved issuer" });
  console.log('passed 3');
  const fileBuffer = await file.toBuffer();
  const res = await issue({
    wallet: verifiedWallet,
    certificateId,
    fileBuffer,
    fileMeta: file,
    student_name: student,
  });

  return reply.send(res);
});

  //to get the verified certificate
  fastify.get("/verify/:certificateID", async (request, reply) => {
    const certificateId = request.params.certificateID;
    const cert = await verify({ certificateId });
    return reply.send(cert);
  });

  //for confirming after the certificate has been issued by fe call
  fastify.post("/confirm", async (request, reply) => {
    const { certificateId, txnHash, studentName, issuerWallet } = request.body;

    if (!certificateId || !txnHash || !studentName || !issuerWallet)
      return reply.code(400).send({ message: "Missing fields" });

    const existing = await IssuedCertificate.findOne({ certificateId });
    if (existing) return reply.send({ message: "Already confirmed" });

    await IssuedCertificate.create({
      certificateId,
      issuerWallet,
      txnHash,
      studentName,
    });

    return reply.send({ success: true });
  });

  //fetching issued certificates by issuer for better ux
  fastify.get("/issued/:wallet", async (request, reply) => {
    const issuerWallet = request.params.wallet;

    const certs = await IssuedCertificate.find({ issuerWallet });

    const certwithStatus = await Promise.all(
      certs.map(async (cert) => {
        const chainData = await getCertificateFromChain(cert.certificateId);
        return {
          certificateId: cert.certificateId,
          studentName: cert.studentName,
          txnHash: cert.txnHash,
          issuedAt: cert.issuedAt,
          isRevoked: chainData ? chainData.isRevoked : false,
        };
      }),
    );

    return reply.send(certwithStatus);
  });

  //to add certificate to saved certificates
  fastify.post("/save", async (request, reply) => {
    const { certificateId, viewerWallet } = request.body;

    if (!certificateId || !viewerWallet)
      return reply.code(400).send({ message: "Missing fields" });

    const existing = await SavedCertificate.findOne({
      certificateId,
      viewerWallet,
    });

    if (existing) return reply.send({ message: "Already saved" });

    await SavedCertificate.create({ certificateId, viewerWallet });
    return reply.send({ success: true });
  });

  //to get all saved certificates
  fastify.get("/saved/:wallet", async (request, reply) => {
    const viewerWallet = request.params.wallet;

    const saved = await SavedCertificate.find({ viewerWallet });

    const certsWithData = await Promise.all(
      saved.map(async (s) => {
        const chainData = await getCertificateFromChain(s.certificateId);
        return {
          certificateId: s.certificateId,
          savedAt: s.savedAt,
          ...chainData,
        };
      }),
    );

    return reply.send(certsWithData);
  });
}

export default certificateRouter;
