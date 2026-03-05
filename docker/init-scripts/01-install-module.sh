#!/usr/bin/env bash

set -e

echo "Enabling module"

if [[ -d "/var/www/html/modules/prestashopvite/" ]]; then
    echo "Enabling prestashopvite..."
    /var/www/html/bin/console prestashop:module install prestashopvite
    /var/www/html/bin/console prestashop:module enable prestashopvite
fi

echo "Module enabled!"