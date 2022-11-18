import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "AuthorizedPersons-tsTest"; //process.env.TABLE_NAME;
const INDEX_NAME = "GSI";
const REGION = process.env.AWS_REGION;
const config = { region: REGION };
const db = new DynamoDBClient(config);

const createResponse = (statusCode: number, body: unknown) => {
  let response: APIGatewayProxyResult = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      body,
    }),
  };
  return response;
};

export const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const dbParams: QueryCommandInput = {
      ExpressionAttributeValues: {
        ":pk": `User`,
        ":sk": "User::",
      },
      ExpressionAttributeNames: {
        "#pk": "IPK",
        "#sk": "ISK",
      },
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
      TableName: TABLE_NAME,
      IndexName: INDEX_NAME,
    };

    const user = await db.send(new QueryCommand(dbParams));

    return createResponse(200, {
      users: user.Items ?? [],
    });
  } catch (error) {
    const msg = (error as any).message;
    return createResponse(400, { errorMessage: msg });
  }
};
