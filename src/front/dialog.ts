export function createDialog() {
    let dialog = document.createElement('dialog') as HTMLDialogElement;
    dialog.id = 'vite-dialog';
    document.body.append(dialog);

    let button = document.createElement('button');
    button.classList.add('close');
    button.textContent = '×';
    button.addEventListener('click', () => dialog.close());
    dialog.append(button);

    let text = document.createElement('strong') as HTMLHeadingElement;
    text.textContent = 'This is a TypeScript + Vite + Prestashop module';
    dialog.append(text);


    let product_container = document.createElement('div') as HTMLDivElement;
    product_container.id = 'vite_product_container';
    dialog.append(product_container);

    return dialog;
}