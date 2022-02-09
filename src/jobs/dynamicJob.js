import config from "#config";
import Logger from "#loaders/logger";
import { buildUrlWithParams, buildUrlWithQuery } from "#util";
import fetch from "node-fetch";

const dynamicJob = async (job, done) => {
  try {
    const {
      attrs: { data },
    } = job;

    const { data: props, callback } = data;

    Logger.debug("✌️ Calling Job " + job.attrs.name);

    let uri = buildUrlWithParams({ url: data.url, params: props?.params });
    uri = buildUrlWithQuery({ url: uri, query: props?.query });

    const options = {
      method: props.method,
      body: JSON.stringify(props?.body || {}),
      headers: props.headers,
    };

    if (["GET", "HEAD"].includes(props.method)) delete options.body;

    // Error if no response in timeout for lambdas
    Promise.race([
      new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error("TimeOutError")), config.timeout)
      ),
      fetch(uri, options),
    ])
      .catch((err) => {
        job.fail(`options: ${JSON.stringify(options)} message: ${err.message}`);
        return { error: err.message };
      })
      .then(async (res) => {
        const result = await res.json();

        if (callback) {
          return fetch(callback.url, {
            method: callback.method,
            headers: callback.headers,
            body: JSON.stringify({ response: result }),
          });
        }
      })
      .catch((err) => job.fail(`failure in callback: ${err.message}`))
      .then(() => done());
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default dynamicJob;
