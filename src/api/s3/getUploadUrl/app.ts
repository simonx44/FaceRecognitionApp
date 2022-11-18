import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPostOptions } from '@aws-sdk/s3-presigned-post';

// Gültigkeitsdauer des übergebenen Links
const URL_EXPIRATION_SECONDS = 600;
const BUCKET = process.env.BUCKET ?? '';
const s3Client = new S3Client({ region: process.env.AWS_REGION });

type QueryParametersT = {
    type: 'png' | 'jpeg' | 'jpg';
    firstname: string;
    lastname: string;
};

const createResponse = (statusCode: number, body: unknown) => {
    let response: APIGatewayProxyResult = {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            body,
        }),
    };
    return response;
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const msg = 'some error happened';
    const EVENT_MISSING = 'Required query parameter type missing';

    if (!event || !event.queryStringParameters) {
        return createResponse(400, EVENT_MISSING);
    }

    const { type } = event.queryStringParameters as QueryParametersT;

    if (!type) {
        return createResponse(400, EVENT_MISSING);
    }

    try {
        var result = await getUploadURL(event.queryStringParameters as QueryParametersT);

        return createResponse(200, result);
    } catch (err: unknown) {
        return createResponse(400, msg);
    }
};

/**
 * Erzeugt eine URL zum direkten Upload in ein Bucket
 * @param {*} parameters
 * @returns
 */
const getUploadURL = async function (input: QueryParametersT) {
    const Key = `${uuidv4()}.${input.type}`;

    const Fields = {
        acl: 'public-read',
    };

    const Conditions2: PresignedPostOptions['Conditions'] = [{ acl: 'public-read' }];

    const options: PresignedPostOptions = {
        Bucket: BUCKET,
        Key,
        Conditions: Conditions2,
        Fields,
        Expires: URL_EXPIRATION_SECONDS,
    };

    const result = await createPresignedPost(s3Client, options);

    return result;
};
