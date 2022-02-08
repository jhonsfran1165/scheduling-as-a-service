import Logger from "#loaders/logger";
import { celebrate, Joi } from "celebrate";
import { Router } from "express";
import { Container } from "typedi";

const route = Router();

export default (app) => {
  const agenda = Container.get("agendaInstance");

  app.use("/jobs", route);

  route.post("/", async (req, res) => {
    Logger.debug("Calling jobs/ endpoint with body: %o", req.body);

    try {
      // TODO: add pagination with find, sort, limit and skip
      const jobs = await agenda.jobs(
        { name: "printAnalyticsReport" },
        { _id: -1 }
      );

      return res.json({ jobs }).status(200);
    } catch (e) {
      Logger.error("🔥 error: %o", e);
      return next(e);
    }
  });

  route.post(
    "/delete",
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      Logger.debug("Calling jobs/delete endpoint with body: %o", req.body);

      try {
        const numRemoved = await agenda.cancel({ name: req.body.name });
        return res.json({ numRemoved }).status(200);
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(
    "/disable",
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      Logger.debug("Calling jobs/disable endpoint with body: %o", req.body);

      try {
        const numDisabled = await agenda.disable({ name: req.body.name });
        return res.json({ numDisabled }).status(200);
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  /** Enables any jobs matching the passed mongodb-native query, allowing any matching jobs to be run by the Job Processor. */
  route.post(
    "/enable",
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      Logger.debug("Calling jobs/enable endpoint with body: %o", req.body);

      try {
        const numEnabled = await agenda.enable({ name: req.body.name });
        return res.json({ numEnabled }).status(200);
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  /** Removes all jobs in the database without defined behaviors. Useful if you change a
   * definition name and want to remove old jobs. Returns a Promise resolving to the number
   * of removed jobs, or rejecting on error.
   * IMPORTANT: Do not run this before you finish defining all of your jobs. If you do, you will nuke your database of jobs.
   */
  route.post(
    "/purge",
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      Logger.debug("Calling jobs/purge endpoint with body: %o", req.body);

      try {
        const numPurged = await agenda.purge({ name: req.body.name });
        return res.json({ numPurged }).status(200);
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
