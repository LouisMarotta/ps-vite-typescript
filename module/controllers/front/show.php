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
        // Tools::getValue() returns false when a parameter is missing, so rely
        // on its own default instead of the null coalescing operator.
        $this->action = Tools::getValue('action', 'showPage');
        $this->page = (int) Tools::getValue('page', 0);
        $this->limit = (int) Tools::getValue('limit', 20);

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

            return;
        }

        $this->processGetProducts();
    }

    protected function showPage() {
        $this->template = 'module:prestashopvite/views/templates/front/app.tpl';

        // The front controller renders the page once initContent() returns, so
        // calling display() here would output the whole page twice.
        parent::initContent();
    }
}