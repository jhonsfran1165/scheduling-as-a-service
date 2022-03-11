import dependencyInjectorLoader from "#loaders/dependencyInjector";
import expressLoader from "#loaders/express";
import jobsLoader from "#loaders/jobs";
import Logger from "#loaders/logger";
import mongooseLoader from "#loaders/mongoose";

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
