import { Router } from "express";
import agendash from "./routes/agendash";
import jobs from "./routes/jobs";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  jobs(app);
  agendash(app);

  return app;
};
