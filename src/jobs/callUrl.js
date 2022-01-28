import fetch from "node-fetch";

const callUrl = async (job, done) => {
  try {
    Logger.debug("✌️ Calling url Job triggered!");
    const { url } = job.attrs.data;
    await fetch(url);
    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default callUrl;
