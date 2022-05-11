import config from "#config";
import Logger from "#loaders/logger";
import { poll } from "#util";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DescribeExecutionCommand, SFNClient } from "@aws-sdk/client-sfn";
import { Container } from "typedi";

const {
  dataLakeName,
  awsRegion,
  lambdaPrice,
  functionsPrice,
  dynamoPrice,
  whalePrice,
  s3Price,
  athenaPrice,
} = config.awsDataLake;
let env = process.env.NODE_ENV === "production" ? "prod" : "dev";

const setPriceETL = async (job, done) => {
  try {
    Logger.debug("✌️ Calling setPriceETL Job " + job.attrs.name);

    const agenda = Container.get("agendaInstance");
    const { payload } = job.attrs.data;
    const { executionArn, batchId, userId } = payload;

    const sfn = new SFNClient({
      region: awsRegion,
    });

    const commandSFN = new DescribeExecutionCommand({
      executionArn,
    });

    const validate = (data) => data.stopDate !== undefined;
    const { output, status, startDate, stopDate } = await poll({
      fn: sfn,
      params: commandSFN,
      validate,
      interval: config.timeout / 50,
      maxAttempts: 50,
    });

    // TODO: if step function fail then send email or retry with the same
    if (status === "SUCCEEDED") {
      const {
        batch_data: { batch_id, storage_s3, athena_scanned, loaddate },
        pipeline_data: { steps_transitions, dynamo_calls },
      } = JSON.parse(output);

      const diffTime = Math.abs(new Date(stopDate) - new Date(startDate));
      const lambdaCost = parseFloat(lambdaPrice) * diffTime;
      const functionsCost = parseFloat(functionsPrice) * steps_transitions;
      const S3Cost = parseFloat(s3Price) * (storage_s3 / 1000000000);
      const dynamoCost = parseFloat(dynamoPrice) * dynamo_calls;
      const athenaCost =
        parseFloat(athenaPrice) * (athena_scanned / 1000000000);
      const totalCost =
        parseFloat(lambdaCost) +
        parseFloat(whalePrice) +
        parseFloat(functionsCost) +
        parseFloat(S3Cost) +
        parseFloat(dynamoCost) +
        parseFloat(athenaCost);

      const params = {
        // TODO: change this
        TableName: `${dataLakeName}-${env}`,
        ExpressionAttributeValues: {
          ":batch_id": { S: batch_id },
          ":cost": { N: `${totalCost.toFixed(2)}` },
        },
        Key: {
          pk_id: { S: userId },
          loaddate: { S: loaddate },
        },
        ConditionExpression: "batch_id = :batch_id",
        UpdateExpression: "SET cost = :cost",
      };

      const dynamoDB = new DynamoDBClient({
        region: awsRegion,
      });

      const commandDynamo = new UpdateItemCommand(params);
      await dynamoDB.send(commandDynamo);
    } else {
      await agenda.now("send:slack", {
        payload: {
          body: {
            msg: `ETL fallando executionArn: ${executionArn} - batchId: ${batchId}`,
          },
        },
      });

      throw new Error(
        `ETL fallando executionArn: ${executionArn} - batchId: ${batchId}`
      );
    }

    done();
  } catch (e) {
    Logger.error("🔥 Error with Calling url Job: %o", e);
    done(e);
  }
};

export default setPriceETL;
