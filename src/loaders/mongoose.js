import config from "#config";
import mongoose from "mongoose";

export default async () => {
  const connection = await mongoose.connect(config.databaseURL, {
    useUnifiedTopology: true,
  });
  return connection.connection.db;
};
