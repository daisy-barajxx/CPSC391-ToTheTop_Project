<script lang="ts">
    import type { PageProps } from "./$types";
    import { userState } from "$lib/user.svelte";
    import { goto } from "$app/navigation";

    let { form }: PageProps = $props();

    $effect(() => {
        if (form?.user) {
            userState.user = form.user;

            goto("/");
        }
    });
</script>

<main>
    <h2>Login</h2>

    <form action="" method="post">
        <input type="text" name="username" placeholder="Username" required />

        <input
            type="password"
            name="password"
            placeholder="Password"
            required
        />

        <button type="submit">Login</button>
    </form>

    {#if form?.error}
        <p>{form.error}</p>
    {/if}
</main>

<style>
    input {
        display: block;
        margin-bottom: 1rem;
    }
</style>
