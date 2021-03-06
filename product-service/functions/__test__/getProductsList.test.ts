import { APIGatewayEvent, Context } from 'aws-lambda';
import utils from 'aws-lambda-test-utils';
import { getProductsList } from '../getProductsList';
import { productRepository } from '../../repository';

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
        const requestSpy = jest.spyOn(productRepository, 'getAll').mockImplementation(() => Promise.resolve([]));

        const actual = await getProductsList(event, ctx, () => null);
        const expected = {
            ...baseRequest,
            statusCode: 200,
            body: JSON.stringify([]),
        };

        expect(actual).toEqual(expected);
        expect(requestSpy).toHaveBeenCalled();
    });

    it('should respond with error status = 500', async () => {
        const errorMessage = 'error';
        const event: APIGatewayEvent = utils.mockEventCreator.createAPIGatewayEvent();
        const ctx: Context = utils.mockContextCreator({});
        const requestSpy = jest
            .spyOn(productRepository, 'getAll')
            .mockImplementation(() => Promise.reject({ message: errorMessage }));

        const actual = await getProductsList(event, ctx, () => null);
        const expected = {
            ...baseRequest,
            statusCode: 500,
            body: errorMessage,
        };

        expect(actual).toEqual(expected);
        expect(requestSpy).toHaveBeenCalled();
    });
});
