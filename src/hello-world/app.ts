import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

import { SNSClient, PublishCommand, PublishCommandInput } from '@aws-sdk/client-sns';

const TOPIC = process.env.TOPIC;
const REGION = process.env.REGION;
const config = { region: REGION };
const snsClient = new SNSClient(config);

const publishMessage = async (wasSuccessful: boolean, userId?: string) => {
    const userFound = `The user with the id ${userId} was successfully logged in`;
    const userNotFound = `The attempt failed. No user could be found`;

    const subject = `Sign in ${wasSuccessful ? 'successfull' : 'failed'}`;
    const message = `${subject}\n${wasSuccessful ? userFound : userNotFound}`;

    const input: PublishCommandInput = {
        Message: message,
        TopicArn: TOPIC,
    };

    console.log('PUBLISH');

    const command = new PublishCommand(input);
    await snsClient.send(command);
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    try {
        await publishMessage(true, '24');

        response = {
            statusCode: 200,
            body: JSON.stringify({
                topic: TOPIC,
                message: 'hello world',
            }),
        };
    } catch (err: unknown) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                topic: TOPIC,
                message: err instanceof Error ? err.message : 'some error happened',
            }),
        };
    }

    return response;
};
