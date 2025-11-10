<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import { resolve } from "$app/paths";
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
    <div>
        <a href={resolve("/watchlist")} >
            My Stock Watchlist
        </a>
    </div>
</nav>

{@render children?.()}

<style>
    nav {
        display: flex;
        justify-content: center;
    }
</style>
