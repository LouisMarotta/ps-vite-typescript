<?php
namespace Module\LouisMarotta\PrestashopVite\Classes;

use PrestaShop\PrestaShop\Adapter\Configuration as ConfigurationAdapter;

class ViteFrontController extends \FrontController
{
    public function __construct()
    {
        parent::__construct();
        $this->javascriptManager = new JavascriptModuleManager(
            [_PS_THEME_URI_, _PS_PARENT_THEME_URI_, __PS_BASE_URI__],
            new ConfigurationAdapter()
        );
    }
}