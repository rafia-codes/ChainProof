import Fastify from 'fastify';
import certificateRouter from './routes/certificate';
import multipart from '@fastify/multipart';

const fastify = Fastify({
    logger: true
});

await fastify.register(multipart);

fastify.register(certificateRouter,{
    prefix: '/certificate'
});

fastify.get('/',(request,reply)=>{
    
})

const start = async () => {
    try {
        await fastify.listen({port:3000});
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();