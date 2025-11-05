<script lang="ts">
    import { validateUserInfo } from "$lib/validate";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();

    let formUsername = $state("");
    let formPassword = $state("");
    let invalid = $derived(validateUserInfo(formUsername, formPassword));
</script>

{#snippet invalidDetail(key: string)}
    {#if form?.invalid?.has(key)}
        <p class="invalid-detail">{form.invalid.get(key)}</p>
    {:else if invalid.has(key)}
        <p class="invalid-detail">{invalid.get(key)}</p>
    {/if}
{/snippet}

<main>
    <h2>Login</h2>

    <form action="" method="post">
        <label for="username">Username</label>

        <input
            bind:value={formUsername}
            type="text"
            name="username"
            placeholder="Username"
            minlength="3"
            maxlength="20"
            pattern="^[a-zA-Z0-9_]+$"
            required
        />

        {@render invalidDetail("username")}

        <label for="password">Password</label>

        <input
            bind:value={formPassword}
            type="password"
            name="password"
            placeholder="Password"
            minlength="8"
            maxlength="64"
            required
        />

        {@render invalidDetail("password")}

        <button type="submit">Login</button>
    </form>

    {#if form?.error}
        <p>{form.error}</p>
    {/if}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h2 {
        margin-top: 5rem;
        margin-bottom: 2rem;
    }

    form {
        display: flex;
        flex-direction: column;
        width: 25%;
    }

    label {
        margin: 0.25rem 0;
    }

    input {
        display: block;
        padding: 0.25rem 0.5rem;
        font-size: medium;
        border: 1px solid var(--primary-dark);
        border-radius: 4px;
    }

    input:user-valid {
        border-color: green;
    }

    input:user-invalid {
        border-color: red;
    }

    .invalid-detail {
        margin: 0;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        color: red;
    }

    form > button {
        transition: all 0.1s ease-in-out;
        margin-top: 1rem;
        padding: 0.5rem;
        font-size: medium;
        background-color: var(--primary-light);
        border: 1px solid var(--primary-dark);
        border-radius: 4px;
        cursor: pointer;
    }

    form > button:hover {
        transition: all 0.1s ease-in-out;
        background-color: var(--primary-dark);
        color: var(--primary-light);
    }
</style>
