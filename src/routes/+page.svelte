<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";

    let searchTerm = $state("");
    let results: SearchResult[] = $state([]);

    $effect(() => {
        if (!searchTerm) {
            results = [];
            return;
        }

        search();
    });

    async function search() {
        const res = await fetch(`/stocks/search?term=${searchTerm}`);
        results = await res.json();
    }
</script>

<h1>Stock Ticker Search</h1>

<input
    placeholder="Search stocks by name or symbol..."
    type="text"
    bind:value={searchTerm}
/>

{#if searchTerm}
    {#if results.length > 0}
        <ul>
            {#each results as stock (stock.symbol)}
                <li>
                    <a href={resolve(`/stocks/${stock.symbol}`)}>
                        {stock.name} ({stock.symbol})
                    </a>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No results found.</p>
    {/if}
{/if}
