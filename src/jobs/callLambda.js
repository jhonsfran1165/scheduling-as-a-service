import fetch from "node-fetch";

const callLambda = async (job, done) => {
  try {
    Logger.debug("✌️ Calling url Job triggered!");
    const { url } = job.attrs.data;
    const response = await fetch(url, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default callLambda;
