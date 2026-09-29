<p align="center">
    <img src="./src/img/prestashop.svg" height="80" width="80">
    <img src="./src/img/vite.svg" height="80" width="80">
    <img src="./src/img/typescript.svg" height="80" width="80">
</p>

# PS Module with Vite and Typescript

A boilerplate Prestashop Module to develop with Vite's HMR capabilities, running on DDEV.

<br>

> [!WARNING]
> This template is still in development!

## Requirements

- [DDEV](https://ddev.com/) 1.24 or newer
- [Bun](https://bun.sh/)

## Getting Started

```bash
bun install
bun run build
ddev start
```

`ddev start` installs PrestaShop, links this repository's `module/` directory into the store's `modules/` folder, then installs and enables the module.

- Store: https://ps-vite-typescript.ddev.site
- Back office: https://ps-vite-typescript.ddev.site/admin-dev

Use `admin@prestashop.com` / `prestashop` to sign in.

Building once before starting is required: the module's `\Vite\Loader` helper needs the generated `manifest.json` to resolve scripts and styles.

To develop with Hot Module Reload, run Vite inside the web container:

```bash
ddev vite
```

DDEV publishes the dev server on https://ps-vite-typescript.ddev.site:5173 so the storefront can load it without running into mixed content errors.

## Choosing the PrestaShop build

Two settings in `.env` decide what gets installed:

| Setting             | Values                | Purpose                                                                                                         |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `PRESTASHOP_FLAVOR` | `default`, `vanilla`  | `vanilla` installs a [VanillaPrestaShop](https://github.com/matrixino/VanillaPrestaShop) build, `default` installs the official release |
| `PS_VERSION`        | any published version | for example `8.2.3` or `9.1.5`                                                                                  |

```bash
PS_VERSION=8.2.8
PRESTASHOP_FLAVOR=vanilla
```

Then rebuild the environment:

```bash
ddev reset
```

Notes:

- PrestaShop 9 no longer ships a release asset for every version, so with the `default` flavor the setup hook resolves the matching "edition" archive automatically.
- VanillaPrestaShop only publishes a subset of versions, for example `8.2.8`, `9.1.5` or `9.2.0-beta.1`. When the requested version does not exist the hook prints the recently published ones.
- `PS_ZIP_SOURCE` pins an exact archive and takes precedence over both flavors.
- The PHP version lives in `.ddev/config.yaml` under `php_version` and should stay in sync with `PHP_VERSION` in `.env`.

## Commands

| Command               | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `ddev start`          | Start the stack and bootstrap PrestaShop         |
| `ddev vite`           | Run the Vite dev server with HMR                 |
| `ddev module-install` | Reinstall and enable the module                  |
| `ddev reset`          | Destroy the store so the next start rebuilds it  |
| `ddev launch`         | Open the store in a browser                      |

## Environment layout

| Path                                 | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| `.ddev/config.yaml`                  | DDEV project configuration                         |
| `.ddev/scripts/prestashop-setup.sh`  | Installs PrestaShop and wires up the module        |
| `.ddev/scripts/sync-hmr.sh`          | Regenerates `hmr.json` from the DDEV hostname       |
| `.ddev/prestashop/`                  | The installed store, git ignored                   |
| `module/`                            | The module itself                                  |
| `src/static/`                        | Static files copied into `module/views/`           |

## Static assets

Everything under `src/static/` is served from the dev server root and copied
verbatim into `module/views/` on build, so the source tree mirrors the output:

| Source            | Dev URL                          | Build output              |
| ----------------- | -------------------------------- | ------------------------- |
| `src/static/js/`  | `https://<host>:5173/js/<file>`  | `module/views/js/<file>`  |
| `src/static/css/` | `https://<host>:5173/css/<file>` | `module/views/css/<file>` |
| `src/static/img/` | `https://<host>:5173/img/<file>` | `module/views/img/<file>` |

Use this folder for files that need a stable name, like third party libraries,
webfonts or images referenced from templates. The `\Vite\Loader` helper resolves
the correct base url for you, see [`getStaticUrl()`](module/src/Classes/Vite/Loader.php:124).

Assets imported from TypeScript or CSS keep going through Vite's asset pipeline.
Files above 4 kB are emitted into `views/img/` or `views/fonts/`, smaller ones are
inlined as data urls. Append `?inline` or `?no-inline` to an import to force either
behaviour. Emitted assets keep a stable filename so a rebuild overwrites them
instead of piling up, since `emptyOutDir` stays off to protect `module/views/`.

## Playwright tests

```shell
bunx playwright install
ddev start
bun run playwright:test
```

## Tips and Gotcha's

- To get jQuery's type completions, you must add `/// <reference types="jquery" />` at the start of the script

- You must keep the project name in `package.json` the same as the module name

- `hmr.json` is generated by DDEV and git ignored, do not edit it by hand

- DDEV runs Apache on purpose. PrestaShop resolves product images and friendly urls through `.htaccess` rewrites, which nginx ignores, so switching `webserver_type` to nginx breaks them

- Vite watches files through DDEV's bind mount, which works on Linux without `server.watch.usePolling`. Enable polling only if HMR stops triggering on macOS or Windows, since polling continuously burns CPU

- If you are working with multiple vite projects at the same time, it's very recommended to change the `hmr.json` port to avoid conflicts

- You can speed up bundling times by switching to Rolldown in `package.json`, it's currently still in beta
```json
  "devDependencies": {
    ...
    "vite": "npm:rolldown-vite@latest"
  }
```

## License
[MIT License](/LICENSE.md)
