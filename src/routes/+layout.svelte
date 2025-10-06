<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import { userState } from "$lib/user.svelte.js";

    let { data, children } = $props();

    $effect(() => {
        if (data?.user) {
            userState.user = data.user;
        }
    });

    $inspect(userState);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav>
    {#if userState.user}
        <span>Welcome, {userState.user.name}</span>
        <a href="/logout">Logout</a>
    {:else}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    {/if}
</nav>
{@render children?.()}
