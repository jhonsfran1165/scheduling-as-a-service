import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error && process.env.NODE_ENV) {
  // This error should crash whole process

  // throw new Error("⚠️  Couldn't find .env file  ⚠️");
  console.log("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Slack
   */
  slack: {
    slackChannel: process.env.SLACK_CHANNEL,
    slackKey: process.env.SLACK_TOKEN,
  },
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI,

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  /**
   * Agenda.js stuff
   */
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: process.env.AGENDA_POOL_TIME,
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY, 10),
  },

  /**
   * Agendash config
   */
  agendash: {
    user: "agendash",
    password: "123456",
  },
  /**
   * API configs
   */
  api: {
    prefix: "/api/v1",
  },
  /**
   * Mailgun email credentials
   */
  emails: {
    apiKey: process.env.MAILGUN_API_KEY,
    apiUsername: process.env.MAILGUN_USERNAME,
    domain: process.env.MAILGUN_DOMAIN,
  },
  defaultTimeZone: process.env.TIMEZONE || "America/Bogota",
  timeout: process.env.TIMEOUT || 900000,
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  /**
   * AWS datalake
   */
  awsDataLake: {
    awsRegion: process.env.AWS_DEFAULT_REGION,
    awsApiKey: process.env.AWS_API_KEY,
    dataLakeName: process.env.DATALAKE_NAME,
    lambdaPrice: process.env.LAMBDA_PRICE,
    dynamoPrice: process.env.DYNAMO_PRICE,
    s3Price: process.env.S3_PRICE,
    functionsPrice: process.env.STEPFUNCTIONS_PRICE,
    athenaPrice: process.env.ATHENA_PRICE,
    whalePrice: process.env.WHALE_PRICE,
  },
  mailChimp: {
    apiKey: process.env.MAILCHIMP_API_KEY,
    dc: process.env.MAILCHIMP_DATACENTER,
  },
};
