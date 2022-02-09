import callUrl from "#jobs/callUrl";
import dynamicJob from "#jobs/dynamicJob";
import Logger from "#loaders/logger";

export default async ({ agenda }) => {
  // TODO: comment this -> or add validation for debug purposes
  agenda
    .on("start", (job) => Logger.debug("Job %s starting", job.attrs.name))
    .on("complete", (job) => Logger.debug(`Job ${job.attrs.name} finished`))
    .on("fail", (err, job) =>
      Logger.debug(`Job failed with error: ${err.message}`)
    );

  /** Dynamic Jobs */
  const jobs = await agenda.jobs({ type: "dynamic" });

  jobs.forEach((job) => {
    agenda.define(
      job.attrs.name,
      { priority: job.attrs.priority, shouldSaveResult: true },
      dynamicJob
    );
  });

  /** Job definitions */
  agenda.define("call:url", { priority: "high" }, callUrl);

  agenda.start();
};
