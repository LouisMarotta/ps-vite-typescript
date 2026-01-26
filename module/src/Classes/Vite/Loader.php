<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Classes\Vite;

use Configuration;

/**
 * Helper class for fetching the correct resources and handling URL's from vite
 */
class Loader {
    CONST POSITION_HEAD = 'top';
    CONST POSITION_BOTTOM = 'bottom';

    private $vite_host = 'http://localhost:5173';
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
    public function __construct($module, $dev = false, $vite_host = null) {
        // TODO: Set this->host by checking the constant variables
        $this->module = $module;
        $this->view_path = _PS_MODULE_DIR_ . $this->module->name . '/views/';
        $this->dev = $dev;

        $this->setPriority(50);
        $this->setPosition(self::POSITION_BOTTOM);

        if (!$vite_host) {
            $vite_constant = $module->getModuleConstant() . '_VITE';

            $this->vite_host = defined($vite_constant)
                ? constant($vite_constant)
                : $this->vite_host;
        }

        $this->manifest = $this->parseManifest();

        $this->configuration = null;
        if (class_exists(Configuration::class)) {
            $this->configuration = new Configuration();
        }
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

    private function parseManifest() {
        $manifest = [];

        $manifest_path = $this->view_path . '.vite/manifest.json';
        if (file_exists($manifest_path)) {
            $file = file_get_contents($manifest_path);

            try {
                $manifest = json_decode($file, true);
            } catch (\Exception $e) { }
        }

        return $manifest;
    }

    public function getHMRUrl() {
        return $this->vite_host . '/@vite/client';
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
            if ($type && $type != $data['name']) {
                continue;
            }

            $resources['js'][] = [
                'position' => $this->position,
                'priority' => $this->priority,
                'inline' => false,
                'attributes' => $this->dev ? 'module' : null,
                'src' => $this->dev
                    ? $this->host . '/' . $dev_url
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