#!/usr/bin/env node

import data from '../package.json' with { type: "json" };
import hmrConfig from '../hmr.json' with { type: "json" };

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { constantCase } from 'es-toolkit/string';
import { TemplateEngine } from './utils.js';
import path from 'path';
import * as fs from 'fs';


const __dirname = dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);

export function compileIncludes(devMode = true, output = null) {
    let engine = new TemplateEngine();
    let isHttps = true;

    // Build HMR url
    let hmrUrl = `${isHttps ? 'https://' : 'http://'}${hmrConfig.host}`;
    if (hmrConfig.clientPort != 443) hmrUrl += `:${hmrConfig.clientPort}`

    // Fetch includes template
    let template = ''
    if (fs.existsSync(`${__dirname}/includes.inc.php`)) {
        template = fs.readFileSync(`${__dirname}/includes.inc.php`, 'utf-8').toString();
    }

    // Compile to file
    let compiled = engine.compile(template, {
        module_name: constantCase(data.name),
        is_dev: devMode.toString(),
        vite: {
            url: hmrUrl
        }
    });

    // Output the file at either the build, or in the module
    if (!output) {
        output = `${root}/module/includes.inc.php`;
    }

    if (fs.existsSync(output)) fs.unlinkSync(output);
    fs.writeFileSync(output, compiled);
}

compileIncludes();