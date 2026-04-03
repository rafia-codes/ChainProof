import Fastify from 'fastify';

const fastify = Fastify({
    logger: true
});

fastify.get('/',function (request,reply){
    reply.send({msg:"hi there"});
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