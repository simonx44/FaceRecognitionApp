import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "@aws-sdk/client-rekognition";
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET = process.env.BUCKET;
const COLLECTION_NAME = process.env.COLLECTION;
const REGION = process.env.AWS_REGION;
const config = { region: REGION };

const client = new AWS.Rekognition(config);
const db = new DynamoDBClient(config);
const s3Client = new S3Client(config);

type RegisterBodyDtoT = {
  image: string;
  properties: { fName: string; lName: string; age: number; id: string };
  userId: string;
};

type FaceIndexResponseT = {
  faceId: string;
  ImageId: string;
  userId: string;
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

const chechIfUserIsAlreadyRegistered = async (
  image: Uint8Array,
  userId: string
) => {
  const config: AWS.SearchFacesByImageCommandInput = {
    CollectionId: COLLECTION_NAME,
    Image: { Bytes: image },
  };

  const res = await client.searchFacesByImage(config);

  let isCallerUser = false;
  const matchedFaces = res.FaceMatches ?? [];
  const top_match = matchedFaces.length > 0 ? matchedFaces[0] : null;

  matchedFaces.forEach((el) => {
    isCallerUser = userId == el.Face?.ExternalImageId;
  });

  if (!isCallerUser && top_match) {
    throw new Error(`User is already registered`);
  }

  return { res, isCallerUser, top_match };
};

const validateUploadedImage = async (img: Uint8Array) => {
  const config: AWS.DetectFacesCommandInput = {
    Image: { Bytes: img },
  };

  const result = await client.detectFaces(config);

  if (!result.FaceDetails || result.FaceDetails.length !== 1) {
    throw new Error("No or multiple faces found");
  }

  const face: AWS.FaceDetail = result.FaceDetails[0];

  if (!face.Confidence || face.Confidence < 90) {
    throw new Error("Confidence failed. Take another image");
  }

  return face;
};

const saveImageToS3 = async (img: Uint8Array, fileName: string) => {
  try {
    const options: PutObjectCommandInput = {
      Bucket: BUCKET,
      Key: fileName,
      ACL: "public-read",
      Tagging: "Indexed=True",
      Body: img,
    };

    const command = new PutObjectCommand(options);

    return await s3Client.send(command);
  } catch (error) {
    console.log(error);
  }
};

const persistFace = async (
  face: FaceIndexResponseT,
  inputData: RegisterBodyDtoT,
  imgAsByteArray: Uint8Array
) => {
  const imageId = uuidv4();
  const fileName = `${imageId}.jpg`;

  console.log(BUCKET);

  await saveImageToS3(imgAsByteArray, fileName);

  const imgUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`;

  const config: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: {
      PK: `User::${face.userId}`,
      SK: "User",
      faceId: `${face.faceId}`,
      IPK: "User",
      ISK: `User::${face.userId}`,
      rekognitionImageId: `${face.ImageId}`,
      imgUrl: imgUrl,
      fileName: fileName,
      property_bag: inputData.properties,
    },
  };

  await db.send(new PutCommand(config));
};

const indexFace = async (
  image: Uint8Array,
  userId: string
): Promise<FaceIndexResponseT> => {
  const config: AWS.IndexFacesCommandInput = {
    CollectionId: COLLECTION_NAME,
    Image: { Bytes: image },
    MaxFaces: 1,
    ExternalImageId: userId,
  };

  const res = await client.indexFaces(config);

  if (!res.FaceRecords || res.FaceRecords.length !== 1) {
    throw new Error("No or multiple faces found");
  }

  const face = res.FaceRecords[0].Face;

  return {
    faceId: face?.FaceId ?? "",
    ImageId: face?.ImageId ?? "",
    userId: userId,
  };
};

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event || !event.body) {
      throw new Error("no body available");
    }

    const body: RegisterBodyDtoT = JSON.parse(event.body);

    const imgAsByteArray = convertBase64ImageTo8Array(body.image);

    const faceDetails = await validateUploadedImage(imgAsByteArray);

    const faces = await chechIfUserIsAlreadyRegistered(
      imgAsByteArray,
      body.userId
    );

    const faceProps = await indexFace(imgAsByteArray, body.userId);

    await persistFace(faceProps, body, imgAsByteArray);

    return createResponse(200, {
      registeredFace: faceProps,
      message: "User successfully registered",
      isCallerUser: faces.isCallerUser,
    });
  } catch (error) {
    const msg = (error as any).message;
    console.log(JSON.stringify(error));
    return createResponse(400, { errorMessage: msg });
  }
};
