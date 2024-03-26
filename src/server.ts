import fastify from "fastify";
import { knex } from "./database";

const server = fastify();

server.get("/", async (request, reply) => {
  const test = await knex('sqlite_schema').select('*')

  return test
});

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running...");
  });
