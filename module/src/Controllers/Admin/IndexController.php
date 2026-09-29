<?php

declare(strict_types=1);

namespace Module\LouisMarotta\PrestashopVite\Controllers\Admin;

use Module\LouisMarotta\PrestashopVite\Classes\Vite\Loader;
use PrestaShopBundle\Controller\Admin\FrameworkBundleAdminController;

class IndexController extends FrameworkBundleAdminController
{
    private $module_name = '';
    private $module = null;
    private $vite = null;
    private $params = [];
    public function __construct()
    {
        parent::__construct();
        $this->module_name = explode('/', \Module::getModuleNameFromClass(__CLASS__))[0];
        $this->module = \Module::getInstanceByName($this->module_name);
        $this->params = ['module_name' => $this->module_name];

        if ($this->module) {
            $this->vite = new Loader($this->module);
        }
    }

    public function indexAction() {
        if ($this->vite === null) {
            // Module not found — render a helpful notice instead of crashing.
            return $this->render(
                '@Modules/' . $this->module_name . '/views/templates/admin/index.html.twig',
                ['module_name' => $this->module_name, 'resources' => []]
            );
        }

        $resources = $this->vite->getResources('back');
        $this->params = array_merge($this->params, ['resources' => $resources]);

        return $this->render(
            '@Modules/' . $this->module_name . '/views/templates/admin/index.html.twig', $this->params
        );
    }

}
