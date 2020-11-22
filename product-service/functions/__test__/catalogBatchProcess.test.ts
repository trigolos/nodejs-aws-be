import * as AWS from 'aws-sdk-mock';
import * as utils from 'aws-lambda-test-utils';
import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import { catalogBatchProcess } from '../catalogBatchProcess';
import { productRepository } from '../../repository';
import { Product } from '../../types';
import { PublishInput } from 'aws-sdk/clients/sns';

const mockProduct: Omit<Product, 'id'> = {
    title: 'title',
    description: 'description',
    price: 100,
    author: 'author',
    count: 1,
};

jest.mock('../../repository', () => ({
    productRepository: {
        create: jest.fn().mockResolvedValue('12345'),
    },
}));

beforeEach(() => {
    AWS.restore();
});

describe('catalogBatchProcess handler', () => {
    const sqsEvent: SQSEvent = {
        Records: [
            {
                body: JSON.stringify(mockProduct),
            } as SQSRecord,
        ],
    };
    const ctx: Context = utils.mockContextCreator({});

    it('should call create method', async () => {
        await AWS.mock('SNS', 'publish', (_msg, callback) => {
            callback();
        });

        await catalogBatchProcess(sqsEvent, ctx, () => null);

        expect(productRepository.create).toHaveBeenCalledWith(mockProduct);
    });

    it('should publish message with SNS', async () => {
        let message: PublishInput;
        await AWS.mock('SNS', 'publish', (msg, callback) => {
            message = msg;
            callback();
        });

        await catalogBatchProcess(sqsEvent, ctx, () => null);

        expect(message.Message).toContain('12345');
    });
});
