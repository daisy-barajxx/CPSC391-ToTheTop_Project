<script lang="ts">
    let searchTerm = $state("");
    let results: { name: string; symbol: string }[] = $state([]);

    async function search() {
        if (!searchTerm) {
            results = [];
            return;
        }
        const res = await fetch(`/stocks/search?term=${searchTerm}`);
        results = await res.json();
    }
</script>

<h1>Stock Ticker Search</h1>

<input
    placeholder="Search stocks by name or symbol..."
    type="text"
    bind:value={searchTerm}
    oninput={search}
/>

{#if searchTerm}
    {#if results.length > 0}
        <ul>
            {#each results as stock}
                <li>
                    <a href={`/stocks/${stock.symbol}`}
                        >{stock.name} ({stock.symbol})</a
                    >
                </li>
            {/each}
        </ul>
    {:else}
        <p>No results found.</p>
    {/if}
{/if}

<!-- <h1>Welcome to SvelteKit</h1>
<p>
Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
    documentation
</p>

<a href="stocks/msft">This is a link to a stock.</a> -->
