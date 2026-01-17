<?php
namespace Module\LouisMarotta\PrestashopVite\Traits;

trait ViteModuleTrait {
    private function getModuleConstant() {
        return strtoupper($this->name);
    }

    private function isDev() {
        $key = $this->getModuleConstant() . '_DEV';
        return defined($key) && constant($key);
    }
}