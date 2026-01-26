<?php
declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

include_once dirname(__FILE__) . '/vendor/autoload.php';
if (file_exists(dirname(__FILE__) . '/includes.inc.php')) {
    include_once dirname(__FILE__) . '/includes.inc.php';
}

use \Module\LouisMarotta\PrestashopVite\Traits\ViteModuleTrait;
use \Module\LouisMarotta\PrestashopVite\Classes\Vite\Loader;

class PrestashopVite extends Module
{
    use ViteModuleTrait;

    public function __construct()
    {
        $this->name = 'prestashopvite';
        $this->author = 'Louis Marotta';
        $this->version = '0.0.1';
        $this->ps_versions_compliancy = ['min' => '1.7.6', 'max' => _PS_VERSION_];

        parent::__construct();

        $this->description = $this->trans('A PrestaShop module template with Vite and Typescript', []);
        $this->displayName = $this->l('PS Vite');
    }

    public function install() {
        return parent::install()
            && $this->registerHook('header')
            && $this->registerHook('moduleRoutes');
    }

    public function getContent()
    {
        Tools::redirectAdmin(
            $this->context->link->getAdminLink('AdminPrestashopVite')
        );
    }

    public function hookHeader() {
        $this->hookDisplayHeader();
    }

    public function hookDisplayHeader() {
        $templatePath = _PS_MODULE_DIR_ . $this->name . '/views/templates/components/scripts.tpl';
        $loader = new Loader($this);
        if (!$this->context->controller->ajax) {
            $resources = $loader->getResources('front');
            $this->context->smarty->assign([
                'scripts' => $resources['js'],
                'styles' => $resources['css'],
            ]);
            echo($this->fetch($templatePath));
        }
    }

    public function hookModuleRoutes($params)
    {
        return [
            'module-' . $this->name . '-show' => [
                'controller' => 'show',
                'rule' => $this->name . '/show',
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => $this->name,
                ]
            ]
        ];
    }

    public function getModuleConstant() {
        return strtoupper($this->name);
    }
}
