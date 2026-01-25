<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

if (!defined('{{module_name}}_DEV')) {
    define('{{module_name}}_DEV', {{is_dev}});
}

if (!defined('{{module_name}}_VITE')) {
    define('{{module_name}}_VITE', "{{vite.url}}");
}