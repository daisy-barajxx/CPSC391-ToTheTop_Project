<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<h1>Stock {data.symbol}</h1>

<p>Wait, why does the public page require an account?</p>
