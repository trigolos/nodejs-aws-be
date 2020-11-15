import * as AWS from 'aws-sdk-mock';
import * as utils from 'aws-lambda-test-utils';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { importProductsFile } from '../importProductsFile';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

beforeEach(() => {
    AWS.restore(); // restore all the methods and services
});

describe('importProductsFile handler', () => {
    it('should return signed URL', async () => {
        const signedUrl = 'https://test.com';
        const event: APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent({
            queryStringParameters: {
                name: 'products.csv',
            },
        });
        const ctx: Context = utils.mockContextCreator({});
        await AWS.mock('S3', 'getSignedUrl', (_action, _params, cb) => {
            cb(null, signedUrl);
        });

        const actual = await importProductsFile(event, ctx, () => null);
        const expected = {
            ...baseResponse,
            statusCode: 200,
            body: signedUrl,
        };

        expect(actual).toEqual(expected);
    });
});
