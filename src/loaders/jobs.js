import dynamicJob from "#jobs/dynamicJob";
import execETL from "#jobs/execETL";
import sendEmail from "#jobs/sendEmail";
import sendSlack from "#jobs/sendSlack";
import setPriceETL from "#jobs/setPriceETL";
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
  agenda.define("send:email", { priority: "high" }, sendEmail);
  agenda.define("send:slack", { priority: "high" }, sendSlack);
  agenda.define("exec:etl", { priority: "high" }, execETL);
  agenda.define("price:etl", { priority: "high" }, setPriceETL);

  agenda.start();
};
