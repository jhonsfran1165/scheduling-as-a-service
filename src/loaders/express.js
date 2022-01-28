import routes from "#api";
import config from "#config";
import agendash from "agendash";
import express from "express";
import basicAuth from "express-basic-auth";

export default ({ app, agenda }) => {
  /**
   * Define agenda dashboard
   */
  app.use(
    "/dash",
    basicAuth({
      users: {
        [config.agendash.user]: config.agendash.password,
      },
      challenge: true,
    }),
    agendash(agenda)
  );

  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // Transforms the raw string of req.body into json
  app.use(express.json());
  // Load API routes
  app.use(config.api.prefix, routes());

  /// error handlers
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};
