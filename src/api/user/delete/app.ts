import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "@aws-sdk/client-rekognition";
import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DeleteCommandInput,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET = process.env.BUCKET;
const COLLECTION_NAME = process.env.COLLECTION;
const REGION = process.env.AWS_REGION;
const config = { region: REGION };

const client = new AWS.Rekognition(config);
const db = new DynamoDBClient(config);
const s3Client = new S3Client(config);

const createResponse = (statusCode: number, body: unknown) => {
  let response: APIGatewayProxyResult = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({
      body,
    }),
  };
  return response;
};

const getUserInfo = async (userId: string) => {
  const config = {
    TableName: TABLE_NAME,
    ExpressionAttributeValues: {
      ":pk": `User::${userId}`,
      ":sk": "User",
    },
    ExpressionAttributeNames: {
      "#pk": "PK",
      "#sk": "SK",
    },
    KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
  };

  const res = await db.send(new QueryCommand(config));

  const item = res.Items?.[0];

  if (!item) {
    throw new Error("User not found");
  }

  return item;
};

const deleteUser = async (userId: string) => {
  const pk = `User::${userId}`;

  const params: DeleteCommandInput = {
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: "User",
    },
  };

  const deletedUser = await getUserInfo(userId);

  await db.send(new DeleteCommand(params));

  return deletedUser;
};

const deleteImage = async (fileName: string) => {
  const bucketParams: DeleteObjectCommandInput = {
    Bucket: BUCKET,
    Key: fileName,
  };

  await s3Client.send(new DeleteObjectCommand(bucketParams));
};

const deleteFaceVector = async (faceId: string) => {
  const input: AWS.DeleteFacesCommandInput = {
    CollectionId: COLLECTION_NAME,
    FaceIds: [faceId],
  };

  return await client.deleteFaces(input);
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("DELETE FCK");
    if (!event || !event?.queryStringParameters?.id) {
      throw new Error("no body available");
    }

    const userId = event.queryStringParameters.id;

    const deletedUser = await deleteUser(userId);

    await deleteImage(deletedUser.fileName);

    const df = await deleteFaceVector(deletedUser.faceId);

    return createResponse(200, {
      user: deletedUser,
      df,
    });
  } catch (error) {
    const msg = (error as any).message;
    return createResponse(400, { errorMessage: msg });
  }
};
