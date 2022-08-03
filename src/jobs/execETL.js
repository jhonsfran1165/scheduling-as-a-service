import config from "#config";
import Logger from "#loaders/logger";
import { buildUrlWithParams, buildUrlWithQuery } from "#util";
import { v4 as uuidv4 } from "uuid";

const execETL = async (job, done) => {
  try {
    const {
      attrs: { data },
    } = job;

    const { payload } = data;
    const batchId = uuidv4();

    Logger.debug("✌️ Calling execETL Job " + job.attrs.name);

    let uri = buildUrlWithParams({ url: payload.url, params: payload?.params });
    uri = buildUrlWithQuery({ url: uri, query: payload?.query });

    const options = {
      method: payload.method,
      body: JSON.stringify({ ...payload?.body, batch_id: batchId } || {}),
      headers: {
        ...payload.headers,
        "x-api-key": config.awsDataLake.awsApiKey, // ETL serverless-waj
      },
    };

    console.log(options);

    if (["GET", "HEAD"].includes(payload.method)) delete options.body;

    // Error if no response in timeout for lambdas
    Promise.race([
      new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error("TimeOutError")), config.timeout)
      ),
      fetch(uri, options),
    ])
      .catch(async (err) => {
        job.fail(`options: ${JSON.stringify(options)} message: ${err.message}`);
        return { error: err.message };
      })
      .then(async (res) => {
        try {
          const { executionArn = null, message = null } = await res.json();

          if (executionArn === null)
            throw new Error(
              `executionArn is undefined: Error ${JSON.stringify(message)}`
            );

          // helps to trace the job in stepfunctions
          job.attrs.data.payload["executionArn"] = executionArn;
          job.attrs.data.payload["batchId"] = batchId;
          await job.save();
          done();
        } catch (e) {
          console.debug(e);
          throw new Error(e);
        }
      })
      .catch((err) => {
        Logger.error("🔥 Error with Calling Job: %o", err);
        job.fail(`failure in callback: ${err.message}`);
      })
      .then(() => done());
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default execETL;
