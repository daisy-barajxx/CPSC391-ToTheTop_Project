<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import "../styles.css";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>To The Top</title>
    <meta name="description" content="Stock market search and analysis." />
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
