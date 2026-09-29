<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Classes;

if (!defined('_PS_VERSION_')) { exit; }

use JavascriptManager;

/**
 * Adds support to type="module" scripts
 */
class JavascriptModuleManager extends JavascriptManager {
    protected $valid_attribute = ['async', 'defer', 'module'];

    protected function getSanitizedAttribute($attribute)
    {
        return in_array($attribute, $this->valid_attribute, true)
            ? ($attribute == 'module' ? 'type="module"' : $attribute)
            : '';
    }
}