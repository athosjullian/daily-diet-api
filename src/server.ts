import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";

const server = fastify();

// This route should be deleted soon
server.get("/users/all", async () => {
  const test = await knex("users").select("*");

  return test;
});

server.post("/users", async (request, reply) => {
  const { name } = request.body;

  const user = await knex("users")
    .insert({
      id: randomUUID(),
      name,
    })
    .returning("*");

  return reply.status(201).send(user);
});

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running...");
  });
