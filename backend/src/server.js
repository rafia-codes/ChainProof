import Fastify from 'fastify';
import certificateRouter from './routes/certificate.js';
import issuerRouter from './routes/issuer.js';
import multipart from '@fastify/multipart';
import './db.js';
import cors from "@fastify/cors";
import authRouter from './routes/auth.js';

const fastify = Fastify({
    logger: false
});

fastify.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
});

await fastify.register(multipart,{
    attachFieldsToBody: true
});

fastify.register(authRouter,{prefix:'/auth'});
fastify.register(certificateRouter,{prefix: '/certificate'});
fastify.register(issuerRouter,{prefix:'/issuer'});

const start = async () => {
    try {
        await fastify.listen({port:3000});
        console.log("Server is running on port 3000");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();