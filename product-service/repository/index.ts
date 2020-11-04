import { products } from './productList';

export function getById(id: string) {
   return Promise.resolve(products.find(({id: productId}) => productId === id));
}

export function getAll() {
    return Promise.resolve(products);
}
