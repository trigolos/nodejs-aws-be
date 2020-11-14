import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { BUCKET_NAME, REGION } from '../constants';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

export const importProductsFile: APIGatewayProxyHandler = async (event, _context) => {
    console.log('[Event] importProductsFile: ', event);

    try {
        const { name } = event.queryStringParameters;
        const catalogPath = `uploaded/${name}`;

        const s3 = new AWS.S3({ region: REGION });
        const params = {
            Bucket: BUCKET_NAME,
            Key: catalogPath,
            Expires: 60,
            ContentType: 'text/csv',
        };

        const signeUrl = await s3.getSignedUrlPromise('putObject', params);

        return {
            ...baseResponse,
            statusCode: 200,
            body: signeUrl,
        };
    } catch (e) {
        console.log('[Error] getProductsList: ', e.message);

        return {
            ...baseResponse,
            statusCode: 500,
            body: e.message,
        };
    }
};
