import { FastifyInstance } from "fastify/types/instance";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { z } from "zod";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post("/", { preHandler: [checkSessionIdExists] }, (request, reply) => {
    console.log(request.body);

    const mealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      is_on_diet: z.boolean(),
    });

    const mealBody = mealBodySchema.parse(request.body);

    console.log(mealBody);

    return reply.status(201).send(mealBody);
  });
};
