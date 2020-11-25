import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { REGION } from '../constants';
import { SQSHandler } from 'aws-lambda';
import { Product } from '../types';
import { productRepository } from '../repository';

export const catalogBatchProcess: SQSHandler = async (event, _context, _callback) => {
    console.log('[Event] catalogBatchProcess: ', event);

    try {
        const promises: Promise<Product>[] = event.Records.map(async (record) => {
            const { title, description, price, author, count } = JSON.parse(record.body);
            const product: Omit<Product, 'id'> = {
                title,
                description,
                price: Number(price),
                author,
                count: Number(count),
            };

            console.log('[SQS Record] Product from SQS record: ', product);

            const productId = await productRepository.create(product);

            console.log(`[CREATED] Product ID: ${productId}, Properties: ${product}`);

            return {
                id: productId,
                ...product,
            };
        });

        const results = await Promise.allSettled(promises);
        const successfulPromises = results.filter((result) => result.status === 'fulfilled');
        const createdProductIds = successfulPromises.map((result: PromiseFulfilledResult<Product>) => result.value.id);

        const rejectedPromises = results.filter((result) => result.status === 'rejected');
        const errorReasons = rejectedPromises.map((result: PromiseRejectedResult) => result.reason);

        const sns = new AWS.SNS({ region: REGION });

        const message = `Input count: ${event.Records.length}\n\nCreated products:\n${createdProductIds.join(
            '\n',
        )}\n\nNot created:\n${errorReasons.join('\n')}`;
        const withEmptyDescription = !!successfulPromises.filter(
            (result: PromiseFulfilledResult<Product>) => result.value.description.trim() === '',
        ).length;

        console.log('[MessageAttributes] withEmptyDescription: ', withEmptyDescription);

        await sns
            .publish({
                Subject: '[RS AWS] Products created',
                Message: message,
                TopicArn: process.env.SNS_ARN,
                MessageAttributes: {
                    emptyDescription: {
                        DataType: 'String',
                        StringValue: JSON.stringify(withEmptyDescription),
                    },
                },
            })
            .promise();

        console.log('[SNS] Message published: ', message);
    } catch (e) {
        console.log('[Error] catalogBatchProcess: ', e.message);
        throw e;
    }
};
