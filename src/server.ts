import fastify from "fastify";

const server = fastify();

server.get("/", (request, reply) => {
  reply.status(200).send("Hi");
});

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running...");
  });
