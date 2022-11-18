import { S3Event } from "aws-lambda";
import * as AWS from "@aws-sdk/client-rekognition";
import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
} from "@aws-sdk/client-sns";

const COLLECTION_NAME = process.env.COLLECTION;
const TOPIC = process.env.TOPIC;
const REGION = process.env.AWS_REGION;
const config = { region: REGION };

const client = new AWS.Rekognition(config);
const s3Client = new S3Client(config);
const snsClient = new SNSClient(config);

const validateUploadedImage = async (file: string, bucket: string) => {
  const config: AWS.DetectFacesCommandInput = {
    Image: { S3Object: { Bucket: bucket, Name: file } },
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

const publishMessage = async (wasSuccessful: boolean, userId?: string) => {
  const userFound = `The user with the id ${userId} was successfully logged in`;
  const userNotFound = `The attempt failed. No user could be found`;

  const subject = `Sign in ${wasSuccessful ? "successfull" : "failed"}`;
  const message = `${subject}\n${wasSuccessful ? userFound : userNotFound}`;

  const input: PublishCommandInput = {
    Subject: subject,
    Message: message,
    TopicArn: TOPIC,
  };

  const command = new PublishCommand(input);
  await snsClient.send(command);
};

const searchFacesByImage = async (file: string, bucket: string) => {
  const config: AWS.SearchFacesByImageCommandInput = {
    CollectionId: COLLECTION_NAME,
    Image: { S3Object: { Bucket: bucket, Name: file } },
  };

  const res = await client.searchFacesByImage(config);
  const matchedFaces = res.FaceMatches ?? [];
  const top_match = matchedFaces.length > 0 ? matchedFaces[0] : null;

  let isMatch = false;
  if (matchedFaces[0]?.Similarity && matchedFaces[0].Similarity > 0.9) {
    isMatch = true;
  }
  return { isMatch, userId: top_match?.Face?.ExternalImageId };
};

const getImageDetails = (event: S3Event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const fileName = record.s3.object.key;

  if (!fileName || !bucket) {
    throw new Error("No image provided");
  }

  return { bucket, fileName };
};

const deleteImage = async (event: S3Event) => {
  try {
    const { fileName, bucket } = getImageDetails(event);
    const bucketParams: DeleteObjectCommandInput = {
      Bucket: bucket,
      Key: fileName,
    };

    await s3Client.send(new DeleteObjectCommand(bucketParams));
  } catch (error) {}
};

export const lambdaHandler = async (event: S3Event): Promise<void> => {
  try {
    if (!event) {
      throw new Error("Image not found");
    }

    const { fileName, bucket } = getImageDetails(event);

    await validateUploadedImage(fileName, bucket);

    const res = await searchFacesByImage(fileName, bucket);

    if (!res.isMatch) await publishMessage(false);
    else await publishMessage(true, res.userId);
  } catch (error) {
    await publishMessage(false);
  } finally {
    await deleteImage(event);
  }
};
