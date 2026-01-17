import { defineConfig } from 'vite'
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

import hmrConfig from './hmr.json' with { type: "json" };
import data from './package.json' with { type: "json" };
const __dirname = dirname(fileURLToPath(import.meta.url));

// Appended at the start of every file
const license = `/**
 *  @version        v${data.version}
 *  @description    ${data.description}
 *  @author         Louis Marotta <loumb31@gmail.com>
 *  @license        MIT License
 */`;

const outputPath = resolve('./module/views/');

// This will generate multiple scripts based on the entry points (front and back)
export default defineConfig({
    css: {
        transformer: 'lightningcss',
        lightningcss: {
            targets: browserslistToTargets(browserslist('>= 0.25%'))
        }
    },
    server: {
        cors: true,
        hmr: hmrConfig
    },
    dev: {
        sourcemap: true,
    },
    build: {
        lib: {
            entry: {
                'front': resolve(__dirname, 'src/front/main.ts'),
                'back': resolve(__dirname, 'src/back/main.ts')
            },
            name: data.name,
        },
        rollupOptions: {
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: 'css/[name].[ext]',
                banner: license
            }
        },
        cssCodeSplit: true,
        cssMinify: 'lightningcss',
        minify: true,
        manifest: true,
        outDir: outputPath,
        emptyOutDir: false
    },
    esbuild: {
        banner: license
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});