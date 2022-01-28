import config from "#config";
import Agenda from "agenda";
import os from "os";

export default ({ mongoConnection }) => {
  return new Agenda({
    mongo: mongoConnection,
    db: { collection: config.agenda.dbCollection },
    processEvery: config.agenda.pooltime,
    maxConcurrency: config.agenda.concurrency,
    defaultConcurrency: 5,
    lockLimit: 0,
    defaultLockLimit: 0,
    // This will ensure that no other job processor (this one included) attempts to run the job again for the next 10 minutes. If you have a particularly long running job, you will want to specify a longer lockLifetime on each job
    defaultLockLifetime: 10000,
    name: os.hostname + "-" + process.pid,
  });
  /**
   * This voodoo magic is proper from agenda.js so I'm not gonna explain too much here.
   * https://github.com/agenda/agenda#mongomongoclientinstance
   */
};
