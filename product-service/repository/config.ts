import { ClientConfig } from 'pg';

const { PG_HOST, PG_PORT_UPDATED, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

export const config: ClientConfig = {
    host: PG_HOST,
    port: Number(PG_PORT_UPDATED),
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
};
