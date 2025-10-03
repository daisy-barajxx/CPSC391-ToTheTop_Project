<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";

    let { data, children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav>
    {#if data?.user}
        <span>Welcome, {data.user.name}</span>
        <a href="/logout">Logout</a>
    {:else}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    {/if}
</nav>
{@render children?.()}
