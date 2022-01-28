import callUrl from "#jobs/callUrl";

export default ({ agenda }) => {
  // TODO: comment this -> or add validation for debug purposes
  agenda
    .on("start", (job) => Logger.error("Job %s starting", job.attrs.name))
    .on("complete", (job) => Logger.error(`Job ${job.attrs.name} finished`))
    .on("fail", (err, job) =>
      Logger.error(`Job failed with error: ${err.message}`)
    );

  /** Job definitions */
  agenda.define("call:url", { priority: "high" }, callUrl);

  agenda.start();
};
