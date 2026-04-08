import Fastify from 'fastify';
import certificateRouter from './routes/certificate';
import issuerRouter from './routes/issuer';
import multipart from '@fastify/multipart';
import './db';

const fastify = Fastify({
    logger: true
});

await fastify.register(multipart);

fastify.register(certificateRouter,{prefix: '/certificate'});
fastify.register(issuerRouter,{prefix:'/issuer'});

const start = async () => {
    try {
        await fastify.listen({port:3000});
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();