CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products
(
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT,
    price       INTEGER
);

CREATE TABLE stocks
(
    product_id UUID UNIQUE,
    count      INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
