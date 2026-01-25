#!/usr/bin/env node
import * as fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import { snakeCase } from 'es-toolkit/string';
import packageData from '../package.json' with { type: "json" };
import { createZip, jsCreateZip, setupComposer } from './utils.js';
import { getLogger } from "@logtape/logtape";

let logger = getLogger('ps-module-builder');

const BASE_PATH = path.resolve(process.cwd());
const BUILD_PATH = `${BASE_PATH}/dist`;

// Should be fetched from `/dist/module` instead
const MODULE_PATH = `${BASE_PATH}/module`;

let filesystemName = snakeCase(packageData.name);


// The archive name should have the package + branch name
let name = packageData.name;
let git = simpleGit(BASE_PATH);

// This could be empty if no repository is here
let branch = git.revparse(['--abbrev-ref HEAD']) ?? 'local';

console.log(branch);
logger.debug(`${name}_${branch}`);

async function addIndexPHP() {
    async function* walk(dir) {
        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            if (d.isDirectory()) yield* walk(entry);
            else if (d.isFile()) yield entry;
        }
    }
}

async function main() {
    try {
        let path = `${BUILD_PATH}/${filesystemName}`;
        logger.info('Moving file to ' + path);
        fs.cpSync(MODULE_PATH, path, {
            recursive: true
        });

        // TODO: Copy index.php from here into

        logger.debug("Installing composer dependencies");
        setupComposer(path);
        logger.info("Composer dependencies installed!");

        logger.debug('Zipping file...');
        createZip(`${BUILD_PATH}/${filesystemName}.zip`, `${BUILD_PATH}/${filesystemName}/`);

        logger.info('Done!', 'ok');
    } catch (e) {
        logger.error('Error: ' + e, 'error');
    }
}
main();