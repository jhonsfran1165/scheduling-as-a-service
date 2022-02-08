import config from "#config";
import agendash from "agendash";
import basicAuth from "express-basic-auth";
import { Container } from "typedi";

export default (app) => {
  const agendaInstance = Container.get("agendaInstance");

  app.use(
    "/dash",
    basicAuth({
      users: {
        [config.agendash.user]: config.agendash.password,
      },
      challenge: true,
    }),
    agendash(agendaInstance)
  );
};
