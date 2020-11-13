import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { productRepository } from '../repository';
import {Product} from "../types";

const baseResponse = {
    headers: {
        'Access-Control-Allow-Origin': '*',
    }
}

function validate({title, description, price, author, count}: Omit<Product, 'id'>) {
    // simple validation
    return Number.isInteger(count) && count >=0 && Number.isInteger(price) && price >=0 && typeof title === 'string' && typeof description === 'string' && typeof author === 'string';
}

export const createProduct: APIGatewayProxyHandler = async (event, _context) => {
    console.log(`CALL createProduct with body parameters: `, event.body);

    try {
        const { title, description, price, author, count } = JSON.parse(event.body);
        const product: Omit<Product, 'id'> = { title, description, price, author, count };

        if (!validate(product)) {
            console.log(`ERROR createProduct - Invalid request parameters: `, event.body);

            return {
                ...baseResponse,
                statusCode: 400,
                body: 'Invalid request parameters',
            };
        }

        const productId = await productRepository.create(product);

        return {
            ...baseResponse,
            statusCode: 201,
            body: JSON.stringify({ id: productId }),
        };
    } catch (e) {
        console.log(`ERROR createProduct was not created, error: ${e.message}`);

        return {
            ...baseResponse,
            statusCode: 500,
            body: e.message,
        };
    }
}
