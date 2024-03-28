import fastify from "fastify";
import cookie from "@fastify/cookie";
import { knex } from "./database";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const app = fastify();

// This route should be deleted soon
app.get("/users/all", async () => {
  const test = await knex("users").select("*");

  return test;
});

app.register(cookie);

app.post("/users", async (request, reply) => {
  const userBodySchema = z.object({
    name: z.string(),
    email: z.string(),
  });

  let sessionId = request.cookies.sessionId;

  if (!sessionId) {
    sessionId = randomUUID();

    reply.cookie("sessionId", sessionId);
  }

  const userBody = userBodySchema.parse(request.body);

  const { name, email } = userBody;

  const user = await knex("users")
    .insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })
    .returning("*");

  return reply.status(201).send(user);
});
