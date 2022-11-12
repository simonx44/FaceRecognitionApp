import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPostOptions } from '@aws-sdk/s3-presigned-post';

// Gültigkeitsdauer des übergebenen Links
const URL_EXPIRATION_SECONDS = 300;

const s3Client = new S3Client({ region: process.env.AWS_REGION });


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

type QueryParametersT = {
    type:  'png' | 'jpeg' | 'jpg',
    firstname: string,
    lastname: string
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

    if (!event || !event.queryStringParameters ) {
        return createResponse(400, EVENT_MISSING);
    }

    const {type, firstname, lastname} = event.queryStringParameters as QueryParametersT;

    if(!type || !firstname || !lastname){
        return createResponse(400, EVENT_MISSING);
    }


    try {
        var result = await getUploadURL(event.queryStringParameters);

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
    const bucketName = 'tstest-s3authorizedimagesbucket-y3i1x7pja5s3';

    const Key = `${uuidv4()}.${input.type}`;


    const Fields = {
        acl: 'public-read',
    };

    const Conditions2: PresignedPostOptions['Conditions'] = [
    { acl: 'public-read' },
  //  ["starts-with", "$Content-Type", "image/"], 
    ["eq", "$x-amz-meta-firstname", input.firstname], // tag with userid <= the user can see this!
    ["eq", "$x-amz-meta-lastname", input.lastname], // tag with userid <= the user can see this!

];

    const options: PresignedPostOptions = {
        Bucket: bucketName,
        Key,
        Conditions: Conditions2,
        Fields,
        Expires: 600, 
    };

    const result = await createPresignedPost(s3Client, options);

    result.fields["x-amz-meta-lastname"] = input.lastname;
    result.fields["x-amz-meta-firstname"] = input.firstname;

    return result;


};
