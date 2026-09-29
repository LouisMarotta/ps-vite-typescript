<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Classes\Vite;

/**
 * Helper class for fetching the correct resources and handling URL's from vite
 */
class Loader {
    const POSITION_HEAD = 'top';
    const POSITION_BOTTOM = 'bottom';

    private $vite_host = 'https://localhost:5173';
    private $module = null;
    private $manifest = [];
    private $dev = false;
    private $priority = 50;
    private $position = self::POSITION_BOTTOM;
    private $view_path = null;

    /**
     * @param \Module $module
     * @param bool $dev
     * @param string|null $vite_host
     * @return void
     */
    public function __construct($module, $dev = null, $vite_host = null) {
        $this->module = $module;
        $this->view_path = _PS_MODULE_DIR_ . $this->module->name . '/views/';

        // Handle dev mode
        $dev_constant = $module->getModuleConstant() . '_DEV';
        if ($dev === null && defined($dev_constant)) {
            $this->dev = constant($dev_constant);
        } else {
            $this->dev = $dev;
        }

        // Get the vite host
        if (!$vite_host) {
            $vite_constant = $module->getModuleConstant() . '_VITE';

            $this->vite_host = defined($vite_constant)
                ? constant($vite_constant)
                : $this->vite_host;
        }

        // Save the manifest configs
        $this->manifest = $this->parseManifest();
    }

    /**
     * Same function as the one from AssetUrlGeneratorTrait.php
     * @param string $fullPath
     *
     * @return string
     */
    protected function getUriFromPath($fullPath)
    {
        return str_replace(_PS_ROOT_DIR_, rtrim(__PS_BASE_URI__, '/'), $fullPath);
    }

    /**
     * Where the scripts should be located
     * @param self::POSITION_HEAD|self::POSITION_BOTTOM $position
     * @return void
     */
    public function setPosition($position) {
        $this->position = $position;
    }

    /**
     * Priority of the scripts
     * @param int $priority Number between 0 - 999, 0 being the highest
     */
    public function setPriority($priority) {
        $this->priority = max(0, min(999, $priority));
    }

    /**
     * Read and parse the manifest file
     */
    private function parseManifest() {
        $manifest = [];

        $manifest_path = $this->view_path . '.vite/manifest.json';
        if (file_exists($manifest_path)) {
            $file = file_get_contents($manifest_path);
            $manifest = json_decode($file, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException(sprintf(
                    'Failed to parse manifest at %s: %s',
                    $manifest_path,
                    json_last_error_msg()
                ));
            }
        }

        return $manifest;
    }

    /**
     * Get the Hot Module Reload script url
     * @return string
     */
    public function getHMRUrl() {
        return $this->vite_host . '/@vite/client';
    }

    /**
     * Resolve a file from src/static, which Vite serves from its root in dev
     * and copies into views/ on build.
     *
     * @param string $path Path relative to the static folder, e.g. 'img/logo.svg'
     * @return string
     */
    public function getStaticUrl($path = '') {
        $base = $this->dev
            ? rtrim($this->vite_host, '/') . '/'
            : $this->getUriFromPath($this->view_path);

        return $base . ltrim($path, '/');
    }


    /**
     * Returns the resources in a format that follows the parameters for
     * @param mixed $type
     * @param mixed $addHMR
     * @return array[]|array{css: array, js: array}
     */
    public function getResources($type = '', $addHMR = true) {
        $module_name = $this->module->name;
        $resources = [
            'js'    => [],
            'css'   => []
        ];

        if ($addHMR && $this->dev) {
            $resources['js'][] = [
                'position' => $this->position,
                'priority' => 50,
                'inline' => false,
                'attributes' => 'module',
                'src' => $this->getHMRUrl(),
                'server' => true
            ];
        }

        foreach ($this->manifest as $dev_url => $data) {
            // The manifest also lists the emitted assets and the shared chunks,
            // only the entry points belong in a script tag.
            if (empty($data['isEntry'])) {
                continue;
            }

            if ($type && $type != $data['name']) {
                continue;
            }

            $resources['js'][] = [
                'position' => $this->position,
                'priority' => $this->priority,
                'inline' => false,
                'attributes' => $this->dev ? 'module' : null,
                'src' => $this->dev
                    ? $this->vite_host . '/' . $dev_url
                    : $this->getUriFromPath($this->view_path . $data['file']),
                'version' => $this->module->version ?? null,
                'server' => $this->dev ? true : false
            ];

            // CSS only needs to be loaded
            if (!$this->dev && isset($data['css']) && is_array($data['css'])) {
                foreach ($data['css'] as $css) {
                    $resources['css'][] = [
                        'media' => 'all',
                        'priority' => 50,
                        'inline' => false,
                        'attributes' => null,
                        'server' => false,
                        'src' => $this->getUriFromPath($this->view_path . $css)
                    ];
                }
            }
        }

        return $resources;
    }
}