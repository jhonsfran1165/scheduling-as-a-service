import config from "#config";
import Logger from "#loaders/logger";

const sendSlack = async (job, done) => {
  try {
    Logger.debug("✌️ Calling sendSlack Job triggered!");

    const { payload } = job.attrs.data;
    const url = "https://slack.com/api/chat.postMessage";

    const body = {
      channel: config.slack.slackChannel,
      text: payload.body.msg,
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": body.length,
        Authorization: `Bearer ${config.slack.slackKey}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }

        return res.json();
      })
      .catch((error) => {
        console.debug(error);
      });

    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default sendSlack;
