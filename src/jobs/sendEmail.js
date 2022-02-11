import Logger from "#loaders/logger";
import { Container } from "typedi";

const sendEmail = async (job, done) => {
  const emailClient = Container.get("emailClient");
  const emailDomain = Container.get("emailDomain");

  try {
    Logger.debug("✌️ Calling email Job triggered!");

    const { payload } = job.attrs.data;

    const data = {
      from: "Sebastian de Whale&Jaguar <me@whaleandjaguar.co>",
      to: [payload.email],
      subject: "Tienes un sentimiento :(",
      text: "Tienes un sentimiento :(!",
    };

    emailClient.messages.create(emailDomain, data);
    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default sendEmail;
