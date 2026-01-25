#!/usr/bin/env node

import data from '../package.json' with { type: "json" };
import hmrConfig from '../hmr.json' with { type: "json" };

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { constantCase } from 'es-toolkit/string';
import { TemplateEngine } from './utils.js';
import * as fs from 'fs';

// Regex as parameter
// https://stackoverflow.com/questions/34498059/replace-regular-expression-in-text-file-with-file-contents-using-node-js
function replace(path) {
    var REGEX = /<replace src="(.+)" \/>/g;
    // load the html file
    var fileContent = fs.readFileSync(path, 'utf8');

    // replacePath is your match[1]
    fileContent = fileContent.replace(REGEX, function replacer(match, replacePath) {
        // load and return the replacement file
        return fs.readFileSync(replacePath, 'utf8');
    });

    // this will overwrite the original html file, change the path for test
    fs.writeFileSync(path, fileContent);
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function compileIncludes(devMode = true, output = null) {
    let engine = new TemplateEngine();

    // Build HMR url
    let hmrUrl = `https://${hmrConfig.host}`;
    if (hmrConfig.clientPort != 443) hmrUrl += `:${hmrConfig.clientPort}`

    // Fetch includes template
    let template = ''
    if (fs.existsSync(`${__dirname}/includes.inc.php`)) {
        template = fs.readFileSync(`${__dirname}/includes.inc.php`, 'utf-8').toString();
    }

    // Compile to file
    let compiled = engine.compile(template, {
        module_name: constantCase(data.name),
        is_dev: devMode,
        vite: {
            url: hmrUrl
        }
    });

    // Output the file at either the build, or in the module
    if (!output) {
        output = `${__dirname}/includes.php`;
    }

    if (fs.existsSync(output)) fs.unlinkSync(output);
    fs.writeFileSync(output, compiled);
}

compileIncludes();