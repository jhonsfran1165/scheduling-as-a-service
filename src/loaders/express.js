import routes from "#api/api";
import config from "#config";
import express from "express";

export default ({ app }) => {
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

  // enable CORS for all routes and for our specific API-Key header
  app.use(function (req, res, next) {
    if (process.env.NODE_ENV !== "development") {
      res.header("Access-Control-Allow-Origin", "*");
    } else {
      res.header("Access-Control-Allow-Origin", config.allowedOrigins);
    }

    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, API-Key"
    );
    next();
  });

  // serve everything in assets folder as static, so we can get our single html page
  app.use(express.static("public"));

  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((_req, _res, next) => {
    const err = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, _req, res, _next) => {
    // handling errors thrown by celebrate validation
    const errorBody = err?.details?.get("body"); // 'details' is a Map()
    let errorDetails = errorBody?.details || null;

    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        details: errorDetails,
      },
    });
  });
};
