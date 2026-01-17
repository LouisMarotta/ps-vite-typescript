#!/usr/bin/env node

import data from '../package.json' with { type: "json" };
import hmrConfig from '../hmr.json' with { type: "json" };
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


function compileIncludes() {
    let engine = new TemplateEngine();
    let template = fs.readFileSync('./bin/includes.php.template', 'utf-8').toString();
    let compiled = engine.compile(template, {
        module_name: constantCase(data.name),
        is_dev: true,
        vite: {
            url: 'https://localhost:5173'
        }
    });

    // Output the file at either the build, or in the module
    fs.writeFileSync('./includes.php', compiled);
}

compileIncludes();