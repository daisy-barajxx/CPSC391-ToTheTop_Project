<script lang="ts">
    import type { PageProps } from "./$types";

    let { data, form }: PageProps = $props();
</script>

<main>
    <h2>Register</h2>

    <form action="" method="post">
        <input type="text" name="username" placeholder="Username" required />

        <input type="text" name="name" placeholder="Name" required />

        <input
            type="password"
            name="password"
            placeholder="Password"
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
