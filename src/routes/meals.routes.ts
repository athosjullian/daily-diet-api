import { FastifyInstance } from "fastify/types/instance";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      });

      const { name, description, date, isOnDiet } = mealBodySchema.parse(
        request.body,
      );

      await knex("meals").insert({
        id: randomUUID(),
        user_id: request.user?.id,
        name,
        description,
        date: date.getTime(),
        is_on_diet: isOnDiet,
      });

      return reply.status(201).send();
    },
  );

  app.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const meals = await knex("meals")
        .where({ user_id: request.user?.id })
        .orderBy("date", "desc");

      return reply.status(200).send({ meals });
    },
  );

  app.get(
    "/:mealId",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealIdSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = mealIdSchema.parse(request.params);

      const meal = await knex("meals")
        .where({
          user_id: request.user?.id,
          id: mealId,
        })
        .first();

      if (!meal) {
        return reply.status(404).send({ error: "Meal not found!" });
      }

      return reply.status(200).send({ meal });
    },
  );

  app.delete(
    "/:mealId",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealIdSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = mealIdSchema.parse(request.params);

      await knex("meals")
        .where({
          user_id: request.user?.id,
          id: mealId,
        })
        .delete();

      return reply.status(204).send();
    },
  );

  app.put(
    "/:mealId",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const mealIdSchema = z.object({ mealId: z.string().uuid() });

      const { mealId } = mealIdSchema.parse(request.params);

      const mealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        isOnDiet: z.boolean(),
      });

      const { name, description, date, isOnDiet } = mealBodySchema.parse(
        request.body,
      );

      const meal = await knex("meals")
        .where({
          user_id: request.user?.id,
          id: mealId,
        })
        .first();

      if (!meal) {
        return reply.status(404).send({ error: "Meal not found!" });
      }

      await knex("meals")
        .where({
          user_id: request.user?.id,
          id: mealId,
        })
        .update({
          name,
          description,
          is_on_diet: isOnDiet,
          date: date.getTime(),
        });

      return reply.status(201).send({ message: "Meal updated" });
    },
  );

  app.get(
    "/metrics",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const totalMeals = await knex("meals")
        .where({ user_id: request.user?.id })
        .select();

      const totalMealsOnDiet = await knex("meals")
        .where({ user_id: request.user?.id, is_on_diet: true })
        .count({ total: "*" })
        .first();

      const totalMealsOffDiet = await knex("meals")
        .where({ user_id: request.user?.id, is_on_diet: false })
        .count({ total: "*" })
        .first();

      const dietStreak = totalMeals.reduce(
        (acc, item) => {
          if (item.is_on_diet) {
            acc.current++;

            acc.max = Math.max(acc.current, acc.max);
          } else {
            acc.current = 0;
          }

          return acc;
        },
        { current: 0, max: 0 },
      );

      const metrics = {
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        dietStreak,
      };

      return reply.status(200).send({ metrics });
    },
  );
};
