import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });
export default defineConfig({
    use: {
        baseURL: process.env.BASE_URL
    },
    testDir: 'tests',
    reporter: process.env.CI 
        ? 'dot' 
        : 'list'
})