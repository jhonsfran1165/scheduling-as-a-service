import agendash from "#api/routes/agendash";
import jobs from "#api/routes/jobs";
import { Router } from "express";

// guaranteed to get dependencies
export default () => {
  const app = Router();

  jobs(app);
  agendash(app);

  return app;
};
