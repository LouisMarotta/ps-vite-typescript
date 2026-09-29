# Customizes the DDEV web image.
# Docs: https://docs.ddev.com/en/stable/users/extend/customizing-images/

ARG BASE_IMAGE
FROM $BASE_IMAGE

SHELL ["/bin/bash", "-c"]

# unzip is used by the PrestaShop bootstrap hook.
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*

# Bun runs the Vite dev server inside the web container.
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "$ARCH" in \
        x86_64) BUN_ARCH="x64" ;; \
        aarch64|arm64) BUN_ARCH="aarch64" ;; \
        *) echo "Unsupported architecture: ${ARCH}" >&2; exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/oven-sh/bun/releases/latest/download/bun-linux-${BUN_ARCH}.zip" -o /tmp/bun.zip; \
    unzip -o /tmp/bun.zip -d /tmp; \
    mv "/tmp/bun-linux-${BUN_ARCH}/bun" /usr/local/bin/bun; \
    chmod +x /usr/local/bin/bun; \
    rm -rf /tmp/bun.zip "/tmp/bun-linux-${BUN_ARCH}"; \
    bun --version
