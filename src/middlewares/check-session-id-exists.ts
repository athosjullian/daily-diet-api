import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }
};
