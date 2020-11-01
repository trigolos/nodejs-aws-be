import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getById } from '../repository';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    }
}

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
    const { productId } = event.pathParameters;

    try {
        const product = await getById(productId);

        if (product === undefined) {
            return {
                ...baseResponse,
                statusCode: 404,
                body: `Product ${productId} not found`,
            }
        }

        return {
            ...baseResponse,
            statusCode: 200,
            body: JSON.stringify(product),
        };
    } catch (e) {
        return {
            ...baseResponse,
            statusCode: 500,
            body: e.message,
        };
    }
}
