import { Router } from "express";
// import agendash from "./routes/agendash";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  // agendash(app);

  return app;
};
