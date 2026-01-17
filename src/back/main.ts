/// <reference types="jquery" />
import './style.css';

const prestashopLogo = new URL('../img/prestashop.svg', import.meta.url).href;
const typescriptLogo = new URL('../img/typescript.svg', import.meta.url).href;
const viteLogo = new URL('../img/vite.svg', import.meta.url).href;
import { setupCounter } from './counter.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://prestashop.com/" target="_blank">
      <img src="${prestashopLogo}" class="logo" alt="PrestaShop logo" />
    </a>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>PrestaShop + Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
