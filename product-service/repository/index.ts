import { Client, ClientConfig } from 'pg';
import { config } from './config';
import { Product } from '../types';

const GET_ALL = 'SELECT * FROM products INNER JOIN stocks ON stocks.product_id = products.id';
const GET_BY_ID = `${GET_ALL} WHERE products.id = $1`;
const CREATE_ITEM = 'INSERT INTO products (title, description, author, price) VALUES ($1, $2, $3, $4) RETURNING id';
const ADD_TO_STOCK = 'INSERT INTO stocks (product_id, count) VALUES ($1, $2)';

export class ProductRepository {
    private readonly config: ClientConfig;

    constructor(config: ClientConfig) {
        this.config = config;
    }

    private async connect(): Promise<Client> {
        const client = new Client(this.config);
        await client.connect();

        return client;
    }

    async getAll(): Promise<Product[]> {
        const client = await this.connect();

        try {
            const { rows } = await client.query<Product>(GET_ALL);

            return rows;
        } finally {
            await client.end();
        }
    }

    async getById(id: string): Promise<Product | undefined> {
        const client = await this.connect();

        try {
            const { rows } = await client.query<Product>(GET_BY_ID, [id]);

            return rows[0];
        } finally {
            await client.end();
        }
    }

    async create(product: Omit<Product, 'id'>): Promise<string> {
        const client = await this.connect();

        try {
            await client.query('BEGIN');
            const { rows } = await client.query<Pick<Product, 'id'>>(CREATE_ITEM, [
                product.title,
                product.description,
                product.author,
                product.price,
            ]);
            const id = rows[0].id;

            await client.query(ADD_TO_STOCK, [id, product.count]);

            await client.query('COMMIT');

            return id;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            await client.end();
        }
    }
}

export const productRepository = new ProductRepository(config);
