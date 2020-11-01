import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getAll } from '../repository';

export const getProductsList: APIGatewayProxyHandler = async (_event, _context) => {
    const allProducts = await getAll();

    return {
        statusCode: 200,
        body: JSON.stringify(allProducts),
    };
}
