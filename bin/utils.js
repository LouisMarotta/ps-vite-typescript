// import { promises as fs, createWriteStream } from 'fs';
import * as fs from 'fs';

import os from 'os';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';
import { pad } from 'es-toolkit/string';
import { isString } from 'es-toolkit/predicate';
import { configureSync, getConsoleSink } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import { getLogger } from "@logtape/logtape";
import * as zipFs from "@zip.js/zip.js";  
import { writeFile } from 'fs/promises';


const isWin = os.platform() === 'win32';

const run = (cmd) => execSync(cmd, {
    stdio: 'inherit',
    shell: isWin ? 'cmd.exe' : 'bash'
});

let logConfigured = false;
if (!logConfigured) {
    logConfigured = configureSync({
        sinks: { console: getConsoleSink({ formatter: prettyFormatter }) },
        loggers: [
            {
                category: ["logtape", "meta"]
            },
            {
                category: "ps-module-builder",
                lowestLevel: "debug",
                sinks: ["console"],
            },
        ],
    });
}
let logger = getLogger('ps-module-builder');

async function addDirectoryRecursively(zipFs, dirPath, zipPath = "") {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(zipPath, entry.name);

        if (entry.isDirectory()) {
            const zipDir = zipFs.addDirectory(relativePath);
            await addDirectoryRecursively(zipFs, fullPath, relativePath);
        } else {
            const fileData = await fs.promises.readFile(fullPath);
            zipFs.addUint8Array(relativePath, fileData);
        }
    }
}

export async function createZip(zipPath, modulePath) {
    const zipFile = new zipFs.fs.FS();
    await addDirectoryRecursively(zipFile, modulePath);

    await fs.writeFileSync(
        zipPath,
        await zipFile.exportUint8Array()
    );
}

export async function setupComposer(run_path = '') {
    const basePath = path.resolve(process.cwd())
    const composerInstaller = basePath + '/bin/composer-phar.php';
    const composer = basePath + '/bin/composer';

    if (!fs.existsSync(basePath + '/bin/composer')) {
        if (!fs.existsSync(composerInstaller)) {
            await downloadFile('https://getcomposer.org/installer', composerInstaller);
        }

        run('php ' + composerInstaller + ' --install-dir=' + basePath + '/bin --filename=composer --2.2');
    }

    let commands = [
        'php ' + composer + ' install --no-dev -o',
        'php ' + composer + ' dump-autoload -o'
    ]

    if (run_path && isString(run_path)) {
        run_path = pad(run_path, 2, '"');
    } else {
        run_path = '';
    }

    commands.forEach(command => {
        run(command + (run_path ? ' --working-dir=' + run_path : ''));
    });
}

export async function addIndexPHP(dir, indexPhpPath = null) {
    const basePath = path.resolve(process.cwd())
    const indexPath = path.join(dir, 'index.php');
    if (!indexPhpPath) {
        indexPhpPath = basePath + '/bin/index.php';
    }
    const indexPhpContent = fs.readFileSync(indexPhpPath, 'utf-8');
    const exceptDirs = ['vendor'];

    try {
        fs.writeFileSync(indexPath, indexPhpContent, { flag: 'wx' });
        logger.debug(`Created: ${indexPath}`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            logger.error(`Error processing ${indexPath}:`, err.message);
        }
    }

    const dirHandle = await fs.opendirSync(dir);
    for await (const entry of dirHandle) {
        if (entry.isDirectory() && !exceptDirs.includes(entry.name)) {
            const entryPath = path.join(dir, entry.name);
            await addIndexPHP(entryPath);
        }
    }
}

async function downloadFile(url, destPath) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(destPath, Buffer.from(buffer));

    logger.info(`Saved to ${destPath}`);
}



/**
 * A simple template engine to replace values inside a regex separator, which by default is `{{ }}`
 *
 * @class
 */
export class TemplateEngine {
    constructor(pattern = /{{\s*([\w.]+?)\s*}}/g) {
        this.pattern = pattern;
    }

    #resolve(path, obj = self, separator = '.') {
        var properties = Array.isArray(path) ? path : path.split(separator)
        return properties.reduce((prev, curr) => prev?.[curr], obj)
    }

    /**
     * Compile a template string using the given data.
     *
     * @param {string} [template=''] The template string to compile.
     * @param {Object} [data={}] The data object to use when compiling the template.
     *
     * @returns {string} The compiled template string.
     */
    compile(template = '', data = {}) {
        return template.replace(this.pattern, (_, token) => this.#resolve(token, data) || '');
    }
}