<?php
/**
 * Resolves the download url of an installable PrestaShop archive.
 *
 * PrestaShop 9 stopped publishing "prestashop_x.y.z.zip" release assets, so the
 * installable archive is an "edition" zip that first has to be looked up. That
 * mapping is maintained by prestashop-flashlight and passed in as a json file,
 * which keeps this repository from having to vendor a version matrix of its own.
 *
 * Usage: php resolve-zip-source.php <version> <versions.json>
 *
 * Prints the resolved url, or nothing when the version has no specific mapping
 * so that the caller can fall back to the official release asset.
 */
declare(strict_types=1);

$version = $argv[1] ?? '';
$mappingPath = $argv[2] ?? '';

if ($version === '' || $mappingPath === '' || !is_readable($mappingPath)) {
    exit(0);
}

$mapping = json_decode((string) file_get_contents($mappingPath), true);

if (!is_array($mapping)) {
    exit(0);
}

foreach ($mapping as $pattern => $flavour) {
    if (!preg_match('#' . $pattern . '#', $version)) {
        continue;
    }

    $sources = $flavour['zip_sources'] ?? [];

    if (!is_array($sources) || $sources === []) {
        exit(0);
    }

    if (isset($sources[$version])) {
        echo $sources[$version];
        exit(0);
    }

    // Fall back to the newest matching build, preferring stable releases.
    $candidates = array_filter(
        $sources,
        static fn (string $key): bool => str_starts_with($key, $version . '-'),
        ARRAY_FILTER_USE_KEY
    );

    if ($candidates === []) {
        exit(0);
    }

    ksort($candidates);

    $stable = array_filter(
        array_keys($candidates),
        static fn (string $key): bool => !preg_match('/-(beta|rc)/', $key)
    );

    $keys = $stable !== [] ? $stable : array_keys($candidates);

    echo $candidates[end($keys)];
    exit(0);
}
