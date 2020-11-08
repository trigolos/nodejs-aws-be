import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productRepository } from '../repository';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
    const { productId } = event.pathParameters;

    console.log('CALL getProductById with productId: ', productId);

    try {
        const product = await productRepository.getById(productId);

        if (!product) {
            return {
                ...baseResponse,
                statusCode: 404,
                body: `Product ${productId} not found`,
            };
        }

        return {
            ...baseResponse,
            statusCode: 200,
            body: JSON.stringify(product),
        };
    } catch (e) {
        console.log(`ERROR getProductById with productId: ${productId}, error: ${e.message}`);

        return {
            ...baseResponse,
            statusCode: 500,
            body: e.message,
        };
    }
};
