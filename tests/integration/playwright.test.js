import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL;
const adminFolder = process.env.PS_FOLDER_ADMIN ?? 'admin-dev';

const moduleUrl = `${baseUrl}/index.php?fc=module&module=prestashopvite&controller=show`;

test.describe('Storefront', () => {
    test('loads the home page', async ({ page }) => {
        await page.goto(baseUrl);

        await expect(page).toHaveTitle(/PrestaShop/);
    });
});

test.describe('Module assets', () => {
    test('injects the module resources on the storefront', async ({ page }) => {
        await page.goto(baseUrl);

        const sources = await page
            .locator('script[src]')
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src') ?? ''));

        // In development the manifest resolves to the Vite dev server, once
        // built it resolves to the module's own views directory.
        const servedByModule = sources.some(
            (src) => src.includes('prestashopvite') || src.includes(':5173')
        );

        expect(servedByModule, `expected a module asset in: ${sources.join(', ')}`).toBeTruthy();
    });
});

test.describe('Module front controller', () => {
    test('renders the app container', async ({ page }) => {
        const response = await page.goto(moduleUrl);

        expect(response?.status()).toBeLessThan(400);
        // Exactly one container, which also guards against the front controller
        // rendering the whole page more than once.
        await expect(page.locator('#app')).toHaveCount(1);
    });

    test('serves the products api', async ({ request }) => {
        const response = await request.get(moduleUrl, {
            params: { action: 'getProducts' }
        });

        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('application/json');

        const payload = await response.json();
        expect(Array.isArray(payload.products)).toBeTruthy();
    });
});

test.describe('Front office app', () => {
    test('requests the products api and renders them in the dialog', async ({ page }) => {
        // The controller renders the page by default, so requesting the api
        // without the action parameter silently returns html instead of json.
        const apiRequest = page.waitForRequest(
            (request) =>
                request.url().includes('prestashopvite/show') &&
                request.url().includes('action=getProducts')
        );

        await page.goto(`${baseUrl}/prestashopvite/show`);
        await apiRequest;

        const products = page.locator('#vite-dialog .vite-product');

        await expect(products.first()).toBeVisible();
        expect(await products.count()).toBeGreaterThan(0);
    });

    test('renders the storefront in standards mode', async ({ page }) => {
        await page.goto(`${baseUrl}/prestashopvite/show`);

        // Guards against header hook output being echoed before the doctype.
        expect(await page.evaluate(() => document.compatMode)).toBe('CSS1Compat');
    });
});

test.describe('Back office', () => {
    test('loads the admin login page', async ({ page }) => {
        await page.goto(`${baseUrl}/${adminFolder}`);

        await expect(page).toHaveTitle(/PrestaShop/);
    });
});
