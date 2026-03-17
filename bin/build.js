#!/usr/bin/env node
import * as fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import { snakeCase } from 'es-toolkit/string';
import packageData from '../package.json' with { type: "json" };
import { addIndexPHP, createZip, setupComposer } from './utils.js';
import { compileIncludes } from './preprocess.js';
import { getLogger } from "@logtape/logtape";
import { argv } from 'process';

let logger = getLogger('ps-module-builder');

const BASE_PATH = path.resolve(process.cwd());
const BUILD_PATH = `${BASE_PATH}/dist`;
const MODULE_PATH = `${BASE_PATH}/module`;

let moduleName = packageData.name;
let filesystemName = snakeCase(moduleName);

let git = await simpleGit({
    baseDir: BASE_PATH,
    binary: 'git'
});
let branch = 'local';
try {
    branch = await git.revparse(['--abbrev-ref', 'HEAD']);

    // Get the last segment of the branch
    branch = branch.split('/').slice(-1)[0];
} catch (e) { }

async function main() {
    try {
        const [, , ...args] = argv;

        let isZipAction = args.length > 0 && args[0] == 'zip';

        let path = isZipAction
            ? `${BUILD_PATH}/${filesystemName}`
            : MODULE_PATH;

        if (isZipAction) {
            logger.info('Moving file to ' + path);
            fs.cpSync(MODULE_PATH, path, {
                recursive: true
            });
        }


        // Generate the includes file with DEV mode off
        compileIncludes(false, `${path}/includes.inc.php`);

        logger.debug("Installing composer dependencies");
        await setupComposer(path);
        logger.info("Composer dependencies installed!");

        if (isZipAction) {
            logger.debug('Zipping file...');
            let zipname = branch
                ? `${filesystemName}_${branch}.zip`
                : `${filesystemName}.zip`;

            await addIndexPHP(`${BUILD_PATH}/${filesystemName}/`);
            createZip(`${BUILD_PATH}/${zipname}`, `${BUILD_PATH}/${filesystemName}/`);
        }
        logger.info('Done!', 'ok');
    } catch (e) {
        logger.error('Error: ' + e, 'error');
    }
}
main();