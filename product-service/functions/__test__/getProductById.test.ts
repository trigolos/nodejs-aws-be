import { APIGatewayEvent, Context } from 'aws-lambda';
import utils from 'aws-lambda-test-utils';
import { getProductById } from '../getProductById';
import { productRepository } from '../../repository';
import { products } from './mockedProductList';

const baseRequest = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getProductsList handler', () => {
    it('should respond with successful status = 200', async () => {
        const event: APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent();
        const ctx: Context = utils.mockContextCreator({});
        const requestSpy = jest
            .spyOn(productRepository, 'getById')
            .mockImplementation(() => Promise.resolve(products[0]));

        const actual = await getProductById(event, ctx, () => null);
        const expected = {
            ...baseRequest,
            statusCode: 200,
            body: JSON.stringify(products[0]),
        };

        expect(actual).toEqual(expected);
        expect(requestSpy).toHaveBeenCalled();
    });

    it('should respond with not found status = 404', async () => {
        const productId = '7567ec4b-b10c-48c5-9345-fc73c48a10ab';
        const event: APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent({
            pathParameters: {
                productId: productId,
            },
        });
        const ctx: Context = utils.mockContextCreator({});
        const requestSpy = jest
            .spyOn(productRepository, 'getById')
            .mockImplementation(() => Promise.resolve(undefined));

        const actual = await getProductById(event, ctx, () => null);
        const expected = {
            ...baseRequest,
            statusCode: 404,
            body: `Product ${productId} not found`,
        };

        expect(actual).toEqual(expected);
        expect(requestSpy).toHaveBeenCalled();
    });

    it('should respond with error status = 500', async () => {
        const errorMessage = 'error';
        const event: APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent();
        const ctx: Context = utils.mockContextCreator({});
        const requestSpy = jest
            .spyOn(productRepository, 'getById')
            .mockImplementation(() => Promise.reject({ message: errorMessage }));

        const actual = await getProductById(event, ctx, () => null);
        const expected = {
            ...baseRequest,
            statusCode: 500,
            body: errorMessage,
        };

        expect(actual).toEqual(expected);
        expect(requestSpy).toHaveBeenCalled();
    });
});
