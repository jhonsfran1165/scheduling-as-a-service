import config from "#config";
import agendaFactory from "#loaders/agenda";
import Logger from "#loaders/logger";
import Mailchimp from "@mailchimp/mailchimp_marketing";
import formData from "form-data";
import Mailgun from "mailgun.js";
import moment from "moment-timezone";
import { Container } from "typedi";

export default ({ mongoConnection, models }) => {
  try {
    models.forEach((m) => {
      Container.set(m.name, m.model);
    });

    moment.tz.setDefault(config.defaultTimeZone);

    const agendaInstance = agendaFactory({ mongoConnection });
    const mgInstance = new Mailgun(formData);

    Mailchimp.setConfig({
      apiKey: config.mailChimp.apiKey,
      server: config.mailChimp.dc,
    });

    Container.set("agendaInstance", agendaInstance);
    Container.set("logger", Logger);
    Container.set("mailChimp", Mailchimp);
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
