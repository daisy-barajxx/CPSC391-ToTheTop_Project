<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";

    let searchTerm = $state("");
    let results: SearchResult[] = $state([]);
    let loading = $state(false);
    let errorMessage = $state("");
    let lastCompletedTerm = $state("");

    // Debounce typing and cancel in-flight requests to avoid flooding the server
    let debounceId: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    $effect(() => {
        const term = searchTerm.trim();

        // Clear pending debounce on each change
        if (debounceId) clearTimeout(debounceId);
        errorMessage = "";

        // Reset state when empty or too short
        if (term.length < 1) {
            if (controller) controller.abort();
            results = [];
            loading = false;
            lastCompletedTerm = "";
            return;
        }

        // Debounce: wait briefly for user to pause typing.
        // Fire immediately for the first character so results appear as soon as typing starts
        const delay = term.length === 1 ? 0 : 150;
        loading = true;

        debounceId = setTimeout(() => {
            search(term);
        }, delay);
    });

    async function search(term: string) {
        try {
            // Cancel the previous request, if any
            if (controller) controller.abort();
            controller = new AbortController();
            loading = true;

            const res = await fetch(`/stocks/search?term=${encodeURIComponent(term)}` , {
                signal: controller.signal
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);

            const data = (await res.json()) as SearchResult[];
            results = data;
            lastCompletedTerm = term;
        } catch (err: unknown) {
            // Ignore abort errors; surface others
            if (!(err instanceof DOMException && err.name === "AbortError")) {
                errorMessage = "Search failed. Please try again.";
            }
        } finally {
            loading = false;
        }
    }
</script>

<h1>Stock Ticker Search</h1>

<input
    placeholder="Search stocks by name or symbol..."
    type="text"
    bind:value={searchTerm}
/>

{#if searchTerm}
    {#if loading}
        <p>Searching…</p>
    {/if}
    {#if errorMessage}
        <p>{errorMessage}</p>
    {/if}
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
        {#if !loading && searchTerm.trim().length >= 1 && lastCompletedTerm === searchTerm.trim()}
            <p>No results found.</p>
        {/if}
    {/if}
{/if}
