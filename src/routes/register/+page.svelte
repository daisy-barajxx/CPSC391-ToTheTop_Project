<script lang="ts">
    import { goto } from "$app/navigation";
    import { validateUserInfo } from "$lib/user";
    import type { PageProps } from "./$types";

    let { form }: PageProps = $props();

    let formUsername = $state("");
    let formName = $state("");
    let formPassword = $state("");
    let dataAccepted = $state(false);
    let invalid = $derived(
        validateUserInfo(formUsername, formPassword, formName)
    );

    $effect(() => {
        if (form?.user) {
            // Registration was successful
            goto("/");
        }
    });
</script>

{#snippet invalidDetail(key: string)}
    {#if form?.invalid?.has(key)}
        <p class="invalid-detail">{form.invalid.get(key)}</p>
    {:else if invalid.has(key)}
        <p class="invalid-detail">{invalid.get(key)}</p>
    {/if}
{/snippet}

<main>
    <h2>Register Your Account</h2>

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

        <label for="name">Name</label>

        <input
            bind:value={formName}
            type="text"
            name="name"
            placeholder="Name"
            minlength="1"
            maxlength="50"
            required
        />

        {@render invalidDetail("name")}

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

        <label for="terms">
            <input type="checkbox" name="terms" id="terms" required />

            I agree to the terms and conditions.
        </label>

        <label for="data">
            <input
                type="checkbox"
                name="data"
                id="data"
                bind:checked={dataAccepted}
            />

            {#if dataAccepted}
                Collect all my data and personal information.
            {:else}
                Do not collect all my data and personal information.
            {/if}
        </label>

        <button type="submit">Register</button>
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

    input[type="checkbox"] {
        display: inline;
    }

    .invalid-detail {
        margin: 0;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        color: red;
    }

    form > button {
        transition: all 0.1s ease-in-out;
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
