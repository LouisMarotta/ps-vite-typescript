#!/usr/bin/env bash
#
# Bootstraps a PrestaShop instance inside the DDEV web container and links this
# repository's module into it.
#
# The script is idempotent: every step is guarded by an existence check, so it
# is safe to run on every `ddev start`.
#
# It runs in the web container, where the project is mounted at /var/www/html.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Include dotfiles such as the store's root .htaccess when moving archives.
shopt -s dotglob nullglob

PROJECT_DIR="/var/www/html"
PS_ROOT="${PROJECT_DIR}/.ddev/prestashop"
PS_MODULES_DIR="${PS_ROOT}/modules"
MODULE_SRC="${PROJECT_DIR}/module"
MODULE_NAME="prestashopvite"
ENV_FILE="${PROJECT_DIR}/.env"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

log() { printf '\033[1;36m[prestashop]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[prestashop]\033[0m %s\n' "$*" >&2; }

# ---------------------------------------------------------------------------
# 1. Configuration
# ---------------------------------------------------------------------------
# Reuse the repository .env so versions and credentials live in a single place.
if [ -f "${ENV_FILE}" ]; then
    set -a
    # shellcheck disable=SC1090
    . "${ENV_FILE}"
    set +a
fi

PS_VERSION="${PS_VERSION:-8.2.3}"
PS_ZIP_SOURCE="${PS_ZIP_SOURCE:-}"
PS_FLAVOR="${PRESTASHOP_FLAVOR:-default}"
PS_ADMIN_FOLDER="${PS_FOLDER_ADMIN:-admin-dev}"

case "${PS_FLAVOR}" in
    default|vanilla) ;;
    *)
        warn "Unknown PRESTASHOP_FLAVOR '${PS_FLAVOR}', expected 'default' or 'vanilla'."
        exit 1
        ;;
esac

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-db}"
DB_USER="${DB_USER:-db}"
DB_PASSWORD="${DB_PASSWORD:-db}"

# DDEV publishes a comma separated list of hostnames; the shop uses the first.
PS_DOMAIN="${DDEV_HOSTNAME%%,*}"
PS_DOMAIN="${PS_DOMAIN:-localhost}"

# ---------------------------------------------------------------------------
# 2. Helpers
# ---------------------------------------------------------------------------

# VanillaPrestaShop repackages PrestaShop releases using the same archive
# layout. Only a subset of versions is published, see its releases page.
vanilla_zip_source() {
    printf 'https://github.com/matrixino/VanillaPrestaShop/releases/download/%s/vanilla_prestashop_%s.zip' \
        "${PS_VERSION}" "${PS_VERSION}"
}

# PrestaShop 9 no longer publishes a "prestashop_x.y.z.zip" release asset, so
# the installable archive has to be resolved from an "edition" url. Rather than
# hardcoding that matrix here, reuse the one maintained by prestashop-flashlight
# and fall back to the official release asset for versions that have one.
resolve_zip_source() {
    if [ "${PS_FLAVOR}" = "vanilla" ]; then
        vanilla_zip_source
        return
    fi

    local versions_json="${TMP_DIR}/prestashop-versions.json"

    if curl -fsSL \
        "https://raw.githubusercontent.com/PrestaShop/prestashop-flashlight/main/prestashop-versions.json" \
        -o "${versions_json}" 2>/dev/null; then

        local resolved
        resolved="$(php "${SCRIPT_DIR}/resolve-zip-source.php" "${PS_VERSION}" "${versions_json}" 2>/dev/null || true)"

        if [ -n "${resolved}" ]; then
            printf '%s' "${resolved}"
            return
        fi
    fi

    printf 'https://github.com/PrestaShop/PrestaShop/releases/download/%s/prestashop_%s.zip' \
        "${PS_VERSION}" "${PS_VERSION}"
}

is_installed() {
    [ -f "${PS_ROOT}/app/config/parameters.php" ] \
        || [ -f "${PS_ROOT}/app/config/parameters.yml" ] \
        || [ -f "${PS_ROOT}/config/settings.inc.php" ]
}

report_vanilla_unavailable() {
    warn "VanillaPrestaShop has no release for ${PS_VERSION}."
    warn "Recently published versions:"

    curl -fsSL \
        "https://api.github.com/repos/matrixino/VanillaPrestaShop/releases?per_page=30" 2>/dev/null \
        | php -r '
            $releases = json_decode(stream_get_contents(STDIN), true) ?? [];
            $tags = array_filter(array_map(
                static fn ($release) => $release["tag_name"] ?? "",
                $releases
            ));
            if ($tags !== []) {
                echo "  " . implode(", ", array_slice(array_values($tags), 0, 12)) . PHP_EOL;
            }
        ' >&2 || true

    warn "Set PS_VERSION to one of them, or use PRESTASHOP_FLAVOR=default."
}

install_prestashop() {
    log "Installing PrestaShop ${PS_VERSION} (${PS_FLAVOR} flavor) into ${PS_ROOT}"

    local source="${PS_ZIP_SOURCE:-$(resolve_zip_source)}"
    log "Source archive: ${source}"

    if ! curl -fsSL "${source}" -o "${TMP_DIR}/prestashop.zip"; then
        if [ "${PS_FLAVOR}" = "vanilla" ]; then
            report_vanilla_unavailable
        fi

        warn "Could not download ${source}"
        exit 1
    fi

    mkdir -p "${TMP_DIR}/extract" "${PS_ROOT}"
    unzip -q "${TMP_DIR}/prestashop.zip" -d "${TMP_DIR}/extract"

    # Official release archives nest the shop inside prestashop.zip, "edition"
    # archives ship a prestashop/ directory, and source archives use a single
    # top level directory. Handle all three layouts.
    if [ -f "${TMP_DIR}/extract/prestashop.zip" ]; then
        unzip -q "${TMP_DIR}/extract/prestashop.zip" -d "${PS_ROOT}"
    elif [ -d "${TMP_DIR}/extract/prestashop" ]; then
        mv "${TMP_DIR}/extract/prestashop/"* "${PS_ROOT}/"
    else
        local entries=()
        while IFS= read -r entry; do
            entries+=("${entry}")
        done < <(find "${TMP_DIR}/extract" -mindepth 1 -maxdepth 1)

        # A single wrapping directory means the archive was built from a source
        # tree, otherwise the shop sits directly at the archive root.
        if [ "${#entries[@]}" -eq 1 ] && [ -d "${entries[0]}" ]; then
            mv "${entries[0]}/"* "${PS_ROOT}/"
        else
            mv "${TMP_DIR}/extract/"* "${PS_ROOT}/"
        fi
    fi

    # The CLI installer relocates the admin directory unless one already exists,
    # so pre-create it under a predictable name.
    if [ -d "${PS_ROOT}/admin" ] && [ ! -d "${PS_ROOT}/${PS_ADMIN_FOLDER}" ]; then
        mv "${PS_ROOT}/admin" "${PS_ROOT}/${PS_ADMIN_FOLDER}"
    fi
}

run_installer() {
    log "Running the PrestaShop CLI installer"

    php -d memory_limit=-1 "${PS_ROOT}/install/index_cli.php" \
        --domain="${PS_DOMAIN}" \
        --db_create=1 \
        --db_server="${DB_HOST}" \
        --db_port="${DB_PORT}" \
        --db_name="${DB_NAME}" \
        --db_user="${DB_USER}" \
        --db_password="${DB_PASSWORD}" \
        --prefix="${PS_DB_PREFIX:-ps_}" \
        --firstname="Admin" \
        --lastname="PrestaShop" \
        --password="${PS_ADMIN_PASSWORD:-prestashop}" \
        --email="${PS_ADMIN_EMAIL:-admin@prestashop.com}" \
        --language="${PS_LANGUAGE:-en}" \
        --country="${PS_COUNTRY:-US}" \
        --all_languages=0 \
        --newsletter=0 \
        --send_email=0 \
        --ssl=1

    log "PrestaShop installed"
}

link_module() {
    mkdir -p "${PS_MODULES_DIR}"

    if [ ! -e "${PS_MODULES_DIR}/${MODULE_NAME}" ]; then
        ln -s "${MODULE_SRC}" "${PS_MODULES_DIR}/${MODULE_NAME}"
        log "Linked ${MODULE_NAME} into the store"
    fi
}

enable_module() {
    if [ ! -f "${PS_ROOT}/bin/console" ]; then
        warn "bin/console not found, skipping module installation"
        return
    fi

    php -d memory_limit=-1 "${PS_ROOT}/bin/console" \
        prestashop:module install "${MODULE_NAME}" \
        || warn "Could not install ${MODULE_NAME}. Run 'bun run build' first so the Vite manifest exists."

    php -d memory_limit=-1 "${PS_ROOT}/bin/console" \
        prestashop:module enable "${MODULE_NAME}" \
        || warn "Could not enable ${MODULE_NAME}."
}

# ---------------------------------------------------------------------------
# 3. Run
# ---------------------------------------------------------------------------
if is_installed; then
    log "PrestaShop is already installed"
    link_module
else
    install_prestashop
    link_module
    run_installer

    rm -rf "${PS_ROOT}/install"
    php -d memory_limit=-1 "${PS_ROOT}/bin/console" cache:clear || true
fi

enable_module

log "Ready at https://${PS_DOMAIN}"
