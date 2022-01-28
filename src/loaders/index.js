import agendaFactory from "./agenda";
import expressLoader from "./express";
import jobsLoader from "./jobs";
import Logger from "./logger";
import mongooseLoader from "./mongoose";

let agendaInstance;

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  // It returns the agenda instance because it's needed in the subsequent loaders
  agendaInstance = agendaFactory({ mongoConnection });
  Logger.info("✌️ Agenda loaded");

  await jobsLoader({ agenda: agendaInstance });
  Logger.info("✌️ Jobs loaded");

  await expressLoader({ app: expressApp, agenda: agendaInstance });
  Logger.info("✌️ Express loaded");
};

async function graceful() {
  await agendaInstance.stop();
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
