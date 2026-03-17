import { test, expect } from '@playwright/test';
let url = process.env.BASE_URL;

test.describe('Backoffice functionality', () => {
    test('should load the admin login page', async ({ page }) => {
        await page.goto(url + '/' + process.env.PS_FOLDER_ADMIN);
        const title = await page.title();
        expect(title).toBe('PrestaShop');
    });
})

test.describe('Frontoffice functionality', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto(url);
        const title = await page.title();
        expect(title).toBe('PrestaShop');
    });
})