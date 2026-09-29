#!/usr/bin/env bash
#
# Regenerates hmr.json from the current DDEV project so that Vite's HMR client
# and the module's asset loader always point at this project's hostname.
#
# Runs on the host via the pre-start exec-host hook.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT_NAME="$(basename "${PROJECT_DIR}")"

# DDEV exports DDEV_HOSTNAME as a comma separated list of hostnames, fall back
# to the conventional hostname when running the script outside of DDEV.
HOST="${DDEV_HOSTNAME:-}"
HOST="${HOST%%,*}"
HOST="${HOST:-${PROJECT_NAME}.ddev.site}"
PORT="${VITE_PORT:-5173}"

cat > "${PROJECT_DIR}/hmr.json" <<JSON
{
    "protocol": "wss",
    "host": "${HOST}",
    "port": ${PORT},
    "clientPort": ${PORT}
}
JSON

printf '\033[1;36m[hmr]\033[0m hmr.json now targets %s\n' "${HOST}"
