<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import { userState } from "$lib/user.svelte";
    import "../styles.css";

    let { data, children } = $props();

    $effect(() => {
        userState.user = data?.user;
    });

    $inspect(userState);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>To The Top</title>
    <meta name="description" content="Stock market search and analysis." />
</svelte:head>

<nav>
    <div class="left">
        <p>Welcome {userState.user?.name ?? "Guest"}</p>
    </div>

    <h1>To The Top</h1>

    <div class="right">
        {#if userState.user}
            <a href="/logout">Logout</a>
        {:else}
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        {/if}
    </div>
</nav>

{@render children?.()}

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.25rem 1rem;
    }

    .left {
        font-size: large;
    }

    .right {
        font-size: large;
        display: flex;
        gap: 1rem;
    }

    .right a {
        text-decoration: none;
        color: inherit;
    }

    .right a:hover {
        text-decoration: underline;
    }
</style>
