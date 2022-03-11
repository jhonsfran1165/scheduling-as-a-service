import config from "#config";
import loaders from "#loaders/loaders";
import Logger from "#loaders/logger";
import express from "express";

let agenda;
let server;

async function startServer() {
  const app = express();
  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  agenda = await loaders({ expressApp: app });
  server = app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on("error", (err) => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();

async function graceful() {
  console.log("\nClosing server...");
  await server.close();
  console.log("Shutting down gracefully...");
  await agenda.stop();
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
