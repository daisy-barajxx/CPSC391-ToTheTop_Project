<script lang="ts">
    import { goto } from "$app/navigation";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
</script>

<main>
    <h2>Register</h2>

    <form action="" method="post">
        <input
            type="text"
            name="username"
            placeholder="Username"
            minlength="3"
            maxlength="20"
            pattern="^[a-zA-Z0-9_]+$"
            required
        />

        <input
            type="text"
            name="name"
            placeholder="Name"
            minlength="1"
            maxlength="50"
            required
        />

        <input
            type="password"
            name="password"
            placeholder="Password"
            minlength="8"
            maxlength="64"
            required
        />

        <button type="submit">Register</button>
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
