import type { Product } from "./product";

export interface ProductApiResponse {
    products: Product[];
}

export function getProducts() {
    let url = window.location.origin;
    let path = '/prestashopvite/show';

    return fetch(url + path)
    .then((body) => {
        return body.json();
    })
    .then((response: ProductApiResponse) => {
        return response.products;
    })
    .catch((error) => { 
        console.error('Error', error)
    });
}