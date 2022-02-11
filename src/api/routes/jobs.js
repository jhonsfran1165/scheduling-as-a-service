import config from "#config";
import dynamicJob from "#jobs/dynamicJob";
import Logger from "#loaders/logger";
import { toTimeZone } from "#util";
import { celebrate, Joi } from "celebrate";
import { Router } from "express";
import { Container } from "typedi";

const route = Router();
const default_priorities = ["highest", "high", "normal", "low", "lowest"];
const default_types = ["normal", "dynamic"];

const jobSchema = {
  name: Joi.string().required(),
  priority: Joi.string()
    .valid(...default_priorities)
    .default("normal"),
  type: Joi.string()
    .valid(...default_types)
    .default("dynamic"),
  payload: Joi.alternatives().conditional("type", {
    is: "dynamic",
    then: Joi.object({
      project: Joi.string().default("oceana"),
      url: Joi.string().uri(),
      method: Joi.string().default("POST"),
      headers: Joi.object().default({ "Content-Type": "application/json" }),
      params: Joi.object().default({}),
      query: Joi.object().default({}),
      body: Joi.object(),
    }),
    otherwise: Joi.object()
      .keys({
        project: Joi.string().default("oceana"),
      })
      .unknown(true),
  }),
  options: Joi.object({
    timezone: Joi.string(),
  }).default({
    timezone: config.defaultTimeZone,
  }),
  callback: Joi.object({
    url: Joi.string(),
    method: Joi.string().default("POST"),
    headers: Joi.object().default({ "Content-Type": "application/json" }),
  }),
};

export default (app) => {
  const agenda = Container.get("agendaInstance");

  app.use("/jobs", route);

  route.post(
    "/",
    celebrate({
      body: Joi.object({
        name: Joi.string(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug("Calling jobs/ endpoint with body: %o", req.body);

      try {
        // TODO: add pagination with find, sort, limit and skip
        const query = {};

        if (req.body?.name) {
          query.name = req.body.name;
        }

        const jobs = await agenda.jobs(query, { _id: -1 });

        return res.json({ jobs }).status(200);
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  route.post(
    "/delete",
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
      }),
    }),
    async (req, res, next) => {
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
    async (req, res, next) => {
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
    async (req, res, next) => {
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
    async (req, res, next) => {
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

  /** Define Jobs */
  route.post(
    "/once",
    celebrate({
      body: Joi.object({
        ...jobSchema,
        when: Joi.alternatives()
          .try(Joi.string(), Joi.number(), Joi.date())
          .required(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug("Calling jobs/define endpoint with body: %o", req.body);

      try {
        const { name, type, priority, options, when, ...payload } = req.body;

        const query = {
          name,
          type,
        };

        const queryKeys = { ...payload, ...options };

        for (const key of Object.keys(queryKeys)) {
          query[`data.${key}`] = queryKeys[key];
        }

        const jobs = await agenda.jobs(query);

        // create job only if it's not exist
        if (!jobs || jobs.length === 0) {
          const job = await agenda.schedule(when, name, {
            ...payload,
            ...options,
          });

          // Set type and timezone
          job.attrs.type = type;

          // Agenda does not support timezone for once method
          if (options.timezone !== config.defaultTimeZone) {
            job.attrs.nextRunAt = toTimeZone(
              job.attrs.nextRunAt,
              options.timezone
            );
          }

          // set priority
          job.priority(priority);

          // Save job
          await job.save();

          // check if there is some definition already with this job
          if (!agenda._definitions.hasOwnProperty(name)) {
            // because this is a dynamic job we have to define its behavior
            agenda.define(
              name,
              { priority, shouldSaveResult: true },
              dynamicJob
            );
          }

          return res.json({ message: "Job successfully saved" }).status(200);
        } else {
          return res
            .json({ message: "This job with the sent data already exist!" })
            .status(400);
        }
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );

  /** Define Jobs */
  route.post(
    "/every",
    celebrate({
      body: Joi.object({
        ...jobSchema,
        startDate: Joi.date(),
        endDate: Joi.date(),
        interval: Joi.string().required(),
        skipDays: Joi.string(),
      }),
    }),
    async (req, res, next) => {
      Logger.debug("Calling jobs/define endpoint with body: %o", req.body);

      try {
        const {
          name,
          type,
          priority,
          options,
          interval,
          startDate,
          endDate,
          skipDays,
          ...payload
        } = req.body;

        const query = {
          name,
          type,
        };

        const queryKeys = { ...payload, ...options };

        for (const key of Object.keys(queryKeys)) {
          query[`data.${key}`] = queryKeys[key];
        }

        const jobs = await agenda.jobs(query);

        // create job only if it's not exist
        if (!jobs || jobs.length === 0) {
          const job = await agenda.every(
            interval,
            name,
            {
              ...payload,
              ...options,
            },
            {
              timezone: options.timezone || config.defaultTimeZone,
              skipImmediate: true,
              skipDays,
              endDate,
              startDate,
            }
          );

          // Set type and timezone
          job.attrs.type = type;

          // set priority
          job.priority(priority);

          // Save job
          await job.save();

          // check if there is some definition already with this job
          if (!agenda._definitions.hasOwnProperty(name)) {
            // because this is a dynamic job we have to define its behavior
            agenda.define(
              name,
              { priority, shouldSaveResult: true },
              dynamicJob
            );
          }

          return res.json({ message: "Job successfully saved" }).status(200);
        } else {
          return res
            .json({ message: "This job with the sent data already exist!" })
            .status(400);
        }
      } catch (e) {
        Logger.error("🔥 error: %o", e);
        return next(e);
      }
    }
  );
};
