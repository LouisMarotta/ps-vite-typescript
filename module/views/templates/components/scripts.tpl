{if isset($styles) && !empty($styles)}
    {foreach $styles as $style}
        <link rel="stylesheet" type="text/css" href="{$style.src}" media="{$style.media}">
    {/foreach}
{/if}


{if isset($scripts) && !empty($scripts)}
    {foreach $scripts as $script}
        <script {if $script.attributes == 'module'}type="module"{/if} src="{$script.src}"></script>
    {/foreach}
{/if}