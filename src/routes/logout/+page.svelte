<script lang="ts">
    import { goto } from "$app/navigation";
    import { userState } from "$lib/user.svelte";

    $effect(() => {
        // Update state and go to home page
        userState.user = null;
        goto("/");
    });
</script>
