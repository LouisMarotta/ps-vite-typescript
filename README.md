<p align="center">
    <img src="./src/img/prestashop.svg" height="80" width="80">
    <img src="./src/img/vite.svg" height="80" width="80">
    <img src="./src/img/typescript.svg" height="80" width="80">
</p>

# PS Module with Vite and Typescript

A boilerplate Prestashop Module to develop with Vite's HMR capabilities.

<br>

> [!WARNING]
> This template is still in development!


## Getting Started

- Building once is required before installing the module and developing, the `\Vite\Loader` helper class needs the generated `manifest.json` to handle the scripts and styles.

```bash
pnpm i
pnpm run build
```
- When running with `pnpm run dev`, the scripts will be served from `http://127.0.0.1:5173`

## DDEV Support

This template was built with DDEV support in mind

1. Mount the `/module` folder into your `/var/www/html/modules` directory.
You can create a file in `.ddev/docker-compose.mounts.yml` and add your module like so:

```yaml
services:
  web:
    volumes:
      - "/ps-vite-typescript/module:/var/www/html/modules/prestashopvite"
```

2. Add the path mappings in your code editor for Xdebug
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "pathMappings": {
                "/var/www/html/modules/prestashopvite": "${workspaceFolder}/src",
                "/var/www/html": "/instances/prestashop/"
            },
            "exclude": [
                "**/vendor/**/*.php",
                "**/smarty_internal_template.php"
            ]

        },
    ]
}
```

## Tips and Gotcha's

- To get jQuery's type completions, you must add `/// <reference types="jquery" />` at the start of the script

- You must keep the project name in `package.json` the same as the module name

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