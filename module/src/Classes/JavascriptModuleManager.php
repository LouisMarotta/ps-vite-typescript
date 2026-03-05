<?php

namespace Module\LouisMarotta\PrestashopVite\Classes;

if (!defined('_PS_VERSION_')) { exit; }

use JavascriptManager;

/**
 * Adds support to type="module" scripts
 */
class JavascriptModuleManager extends JavascriptManager {
    protected $valid_attribute = ['async', 'defer', 'module'];

    private function getSanitizedAttribute($attribute)
    {
        return in_array($attribute, $this->valid_attribute, true)
            ? ($attribute == 'module' ? 'type="module"' : $attribute)
            : '';
    }
}