<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav>
    <h1>To The Top</h1>
</nav>

{@render children?.()}

<style>
    nav {
        display: flex;
        justify-content: center;
    }
</style>
