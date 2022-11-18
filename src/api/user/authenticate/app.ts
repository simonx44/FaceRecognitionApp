import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;
const COLLECTION_NAME = process.env.COLLECTION;
const REGION = process.env.AWS_REGION;
const config = { region: REGION };

const client = new AWS.Rekognition(config);
const db = new DynamoDBClient(config);

type AuthBodyDtoT = {
  image: string;
};

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

const convertBase64ImageTo8Array = (img: string) => {
  const base64SignatureFormat = /data:image\/[a-z]{3,4};base64,/g;

  const convertedImgStr = img.replace(base64SignatureFormat, "");

  const image = Uint8Array.from(atob(convertedImgStr), (v) => v.charCodeAt(0));
  return image;
};

const validateUploadedImage = async (img: Uint8Array) => {
  const config: AWS.DetectFacesCommandInput = {
    Image: { Bytes: img },
    Attributes: ["ALL"],
  };

  const result = await client.detectFaces(config);

  if (!result.FaceDetails || result.FaceDetails.length !== 1) {
    throw new Error("No or multiple faces found");
  }

  const face: AWS.FaceDetail = result.FaceDetails[0];

  if (!face.Confidence || face.Confidence < 90) {
    throw new Error("Confidence failed");
  }

  return face;
};

const searchFacesByImage = async (image: Uint8Array, userId: string) => {
  const config: AWS.SearchFacesByImageCommandInput = {
    CollectionId: COLLECTION_NAME,
    Image: { Bytes: image },
  };

  const res = await client.searchFacesByImage(config);

  let isCallerUser = false;
  const matchedFaces = res.FaceMatches ?? [];
  const top_match = matchedFaces.length > 0 ? matchedFaces[0] : null;

  let isMatch = false;
  if (matchedFaces[0]?.Similarity && matchedFaces[0].Similarity > 0.9) {
    isMatch = true;
  }
  return { isMatch, userId: top_match?.Face?.ExternalImageId };
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

  return item;
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event || !event.body) {
      throw new Error("no body available");
    }

    const body: AuthBodyDtoT = JSON.parse(event.body);

    const imgAsByteArray = convertBase64ImageTo8Array(body.image);

    const faceDetails = await validateUploadedImage(imgAsByteArray);

    const res = await searchFacesByImage(imgAsByteArray, "");

    if (!res.isMatch)
      return createResponse(401, {
        Status: "Unauthorized",
      });

    const userInfo = await getUserInfo(res.userId ?? "");

    return createResponse(200, {
      Status: "Authorized",
      userInfo: userInfo,
      userId: res.userId,
    });
  } catch (error) {
    const msg = (error as any).message;
    return createResponse(400, { errorMessage: msg });
  }
};
