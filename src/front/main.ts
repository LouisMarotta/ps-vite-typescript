/// <reference types="jquery" />
import './style.css';

import { createDialog } from "./dialog";
import { getProducts } from "./api";
// import type { Product } from "./product";
import { createProduct } from "./product_list";

if (['complete', 'interactive'].includes(document.readyState)) {
    init()
} else {
    document.addEventListener('DOMContentLoaded', init)
}

async function init() {
    console.log($);

    let dialog = createDialog();
    localStorage.setItem('wasOpen', 'true');
    let wasOpen = localStorage.getItem('wasOpen') == 'true';

    let products = await getProducts();

    let product_container = dialog.querySelector('#vite_product_container') as HTMLDivElement;
    if (products instanceof Array) {
        products.forEach((product) => {
            product_container.appendChild(createProduct(product));
        });
    }

    if (wasOpen) {
        dialog.showModal();
    }
}