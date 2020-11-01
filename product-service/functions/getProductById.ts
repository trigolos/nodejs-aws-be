import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getById } from '../repository';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
    const { productId } = event.pathParameters;
    const product = await getById(productId);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(product),
    };
}
