import config from "#config";
import formData from "form-data";
import Mailgun from "mailgun.js";
import moment from "moment-timezone";
import { Container } from "typedi";
import agendaFactory from "./agenda";
import Logger from "./logger";

export default ({ mongoConnection, models }) => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });

    moment.tz.setDefault(config.defaultTimeZone);

    const agendaInstance = agendaFactory({ mongoConnection });
    const mgInstance = new Mailgun(formData);

    Container.set("agendaInstance", agendaInstance);
    Container.set("logger", Logger);
    Container.set(
      "emailClient",
      mgInstance.client({
        key: config.emails.apiKey,
        username: config.emails.apiUsername,
      })
    );

    Container.set("emailDomain", config.emails.domain);

    Logger.info("✌️ Agenda injected into container");

    return { agenda: agendaInstance };
  } catch (e) {
    Logger.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
