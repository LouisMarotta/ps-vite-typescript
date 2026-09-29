import type { Product } from "./product";

export interface ProductApiResponse {
    products: Product[];
}

export function getProducts() {
    let url = window.location.origin;
    // The controller renders the page by default, so the product api has to be
    // requested explicitly.
    let path = '/prestashopvite/show?action=getProducts';

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