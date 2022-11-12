import { APIGatewayProxyResult, S3Event } from "aws-lambda";
import { DynamoDB, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import * as AWS from "@aws-sdk/client-rekognition";
import {
  S3Client,
  HeadObjectCommand,
  HeadObjectCommandInput,
} from "@aws-sdk/client-s3";
import {
  IndexFacesCommandInput,
  FaceRecord,
} from "@aws-sdk/client-rekognition";

type MetadataT = { firstname: string; lastname: string };

const TABLE_NAME = process.env.TABLE_NAME;
const COLLECTION_NAME = process.env.COLLECTION;
const REGION = process.env.AWS_REGION;

const config = { region: process.env.AWS_REGION };
const client = new AWS.Rekognition(config);
const db = new DynamoDB(config);
const s3Client = new S3Client(config);

const getImageDetails = (event: S3Event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const fileName = record.s3.object.key;

  return { bucket, fileName };
};

const saveUserToDatabase = async (
  metaData: MetadataT,
  faceRecord: FaceRecord,
  bucketName: string,
  fileName: string
) => {
  const faceId = faceRecord.Face?.FaceId;
  const imgUrl = `https://${bucketName}.s3.${REGION}.amazonaws.com/${fileName}`;

  if (!metaData || !faceRecord || !faceId) {
    throw new Error("FaceId not found");
  }

  const config: PutItemCommandInput = {
    TableName: TABLE_NAME,
    Item: {
      PK: { S: faceId },
      SK: { S: "Face" },
      FirstName: { S: metaData.firstname },
      Lastname: { S: metaData.lastname },
      url: { S: imgUrl },
    },
  };
  await db.putItem(config);
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

const extractImageMetaData = async (
  bucketName: string,
  fileName: string
): Promise<MetadataT> => {
  const config: HeadObjectCommandInput = {
    Bucket: bucketName,
    Key: fileName,
  };

  const command = new HeadObjectCommand(config);
  const res = await s3Client.send(command);

  if (!res.Metadata) {
    throw new Error("No metadata found");
  }

  return res.Metadata as MetadataT;
};

const analyseImage = async (
  bucket: string,
  filename: string
): Promise<FaceRecord> => {
  const config: IndexFacesCommandInput = {
    CollectionId: COLLECTION_NAME,
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: filename,
      },
    },
  };

  const result = await client.indexFaces(config);
  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error("Detection error");
  }

  if (result.FaceRecords?.length != 1) {
    throw new Error("No or multiple faces found");
  }
  return result.FaceRecords[0];
};

export const lambdaHandler = async (event: S3Event): Promise<void> => {
  try {
    const { bucket, fileName } = getImageDetails(event);

    const faceRecord = await analyseImage(bucket, fileName);

    const metadata = await extractImageMetaData(bucket, fileName);

    await saveUserToDatabase(metadata, faceRecord, bucket, fileName);

    /* return createResponse(200, {
      test: "s",
      metadata,
      db: process.env.TABLE_NAME,
    }); */
    return;
  } catch (error) {
    console.log(error);
    return;
    //return createResponse(400, error);
  }
};
