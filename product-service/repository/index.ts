import {Client, ClientConfig, QueryConfig} from 'pg';
import { config } from "./config";
import {Product} from "../types";

const GET_ALL = 'SELECT * FROM products INNER JOIN stocks ON stocks.product_id = products.id';
const GET_BY_ID = `${GET_ALL} WHERE products.id = $1`;

export class ProductRepository {
    private readonly config: ClientConfig;

    constructor(config: ClientConfig) {
        this.config = config;
    }

    async connect() {
        const client = new Client(this.config);
        await client.connect();

        return client;
    }

    async getAll() {
        const client = await this.connect();
        const { rows } = await client.query<Product>(GET_ALL);

        return rows;
    }

    async getById(id: string) {
        const query: QueryConfig = {
            text: GET_BY_ID,
            values: [id]
        }
        const client = await this.connect();
        const { rows } = await client.query<Product>(query);

        return rows[0];
    }
}

export const productRepository = new ProductRepository(config);
