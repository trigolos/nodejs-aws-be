import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getAll } from '../repository';

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    }
}

export const getProductsList: APIGatewayProxyHandler = async (_event, _context) => {
    try {
        const allProducts = await getAll();

        return {
            ...baseResponse,
            statusCode: 200,
            body: JSON.stringify(allProducts),
        };
    } catch (e) {
        return {
            ...baseResponse,
            statusCode: 500,
            body: JSON.stringify(e.message),
        };
    }
}
