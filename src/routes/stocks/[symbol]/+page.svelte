<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<h1>Stock {data.symbol}</h1>
<p>This is a dummy stock page for {data.symbol}.</p>
