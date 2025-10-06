<script lang="ts">
    import type { PageProps } from "./$types";
    import { userState } from "$lib/user.svelte";
    import { goto } from "$app/navigation";

    $effect(() => {
        // If we got here, the user has been logged out
        userState.user = null;

        goto("/");
    });
</script>
