import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { FastifyInstance } from "fastify/types/instance";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export const usersRoutes = async (app: FastifyInstance) => {
  app.get("/", { preHandler: checkSessionIdExists }, async (request, reply) => {
    const { sessionId } = request.cookies;
    const body = await knex("users").where("session_id", sessionId).select();
    return reply.status(200).send(body);
  });

  app.post("/login", async (request, reply) => {
    const emailBodySchema = z.object({
      email: z.string(),
    });

    const emailBody = emailBodySchema.parse(request.body);
    const { email } = emailBody;

    const [user] = await knex("users").where("email", email).select();
    const userSessionId = user.session_id;

    reply.cookie("sessionId", userSessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(200).send(user);
  });

  app.post("/register", async (request, reply) => {
    let { sessionId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    const userBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    });

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
};
