import type { Product } from "./product";

let formatter = new Intl.NumberFormat((window as any).prestashop?.language?.locale, { style: "currency", currency: (window as any).prestashop?.currency?.iso_code ?? 'EUR'  })

export function createProduct(product: Product) {
    let list = document.createElement('div') as HTMLDivElement;
    list.classList.add('vite-product', 'd-flex', 'justify-content-between');
    list.classList.add(product.active ? 'active' : 'disabled');
    list.innerHTML = `
        <div>
            <span>${product.id_product}.</span>
            <span>${product.name}</span>
        </div>
        <div>
            <span>${formatter.format(product.price as number)}</span>
            <span>${product.quantity}x</span>
        </div>
    `
    return list;
}