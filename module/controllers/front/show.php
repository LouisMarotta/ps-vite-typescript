<?php


if (!defined('_PS_VERSION_')) {
    exit;
}

use Module\LouisMarotta\PrestashopVite\Traits\ApiControllerTrait;
use Module\LouisMarotta\PrestashopVite\Classes\ViteFrontController;

class prestashopviteshowModuleFrontController extends ViteFrontController
{
    use ApiControllerTrait;

    private $action = 'showPage';
    private $page = 0;
    private $limit = 20;

    public function postProcess() {
        $this->action = Tools::getValue('action') ?? 'showPage';
        $this->page = Tools::getValue('page') ?? 0;
        $this->limit = Tools::getValue('limit') ?? 20;

        if (version_compare(_PS_VERSION_, '1.7.6', '<')) {
            // $this->container = PrestaShop\PrestaShop\Adapter\ContainerBuilder::getContainer();
        }
    }


    public function processGetProducts()
    {
        $products = Product::getProducts(
            $this->context->language->id,
            $this->page * $this->limit,
            $this->limit,
            'id_product',
            'ASC'
        );

        $columns = ['id_product', 'name', 'quantity', 'price',  'active'];
        $products = array_map(function ($row) use ($columns) {
            return array_intersect_key($row, array_flip($columns));
        }, $products);

        $this->sendResponse(['products' => $products]);
    }

    public function initContent() {
        if ($this->action == 'showPage') {
            $this->showPage();
        } else {
            $this->processGetProducts();
        }
    }

    protected function showPage() {
        $this->template = 'module:prestashopvite/views/templates/front/app.tpl';

        parent::initContent();
        $this->display();
    }
}