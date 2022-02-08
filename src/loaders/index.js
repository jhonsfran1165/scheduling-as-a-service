import dependencyInjectorLoader from "./dependencyInjector";
import expressLoader from "./express";
import jobsLoader from "./jobs";
import Logger from "./logger";
import mongooseLoader from "./mongoose";

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [
      // whateverModel
    ],
  });

  // It returns the agenda instance because it's needed in the subsequent loaders
  Logger.info("✌️ Dependency Injector loaded");

  await jobsLoader({ agenda });
  Logger.info("✌️ Jobs loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");

  return agenda;
};
