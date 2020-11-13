import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productRepository } from '../repository';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

export const getProductsList: APIGatewayProxyHandler = async (_event, _context) => {
    console.log('CALL getProductsList');

    try {
        const allProducts = await productRepository.getAll();

        return {
            ...baseResponse,
            statusCode: 200,
            body: JSON.stringify(allProducts),
        };
    } catch (e) {
        console.log('ERROR getProductsList: ', e.message);

        return {
            ...baseResponse,
            statusCode: 500,
            body: e.message,
        };
    }
};
