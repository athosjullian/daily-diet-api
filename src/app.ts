import fastify from "fastify";
import { knex } from "./database";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const app = fastify();

// This route should be deleted soon
app.get("/users/all", async () => {
  const test = await knex("users").select("*");

  return test;
});

app.post("/users", async (request, reply) => {
  const userBodySchema = z.object({
    name: z.string(),
  });

  const userBody = userBodySchema.parse(request.body);

  const { name } = userBody;

  const user = await knex("users")
    .insert({
      id: randomUUID(),
      name,
    })
    .returning("*");

  return reply.status(201).send(user);
})