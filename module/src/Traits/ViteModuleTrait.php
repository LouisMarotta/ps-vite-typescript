<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Traits;

trait ViteModuleTrait {
    // getModuleConstant() is defined in the using class with the str_replace
    // variant; the trait version would be shadowed by PHP's method precedence.
    // isDev() is unused — Loader handles dev detection from the constants.
}