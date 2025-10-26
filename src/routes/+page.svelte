<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";

    /** Time (ms) to delay search requests. */
    const DEBOUNCE_DELAY = 200;
    /** Num characters to trigger search.*/
    const DEBOUNCE_CHARS = 3;

    let searchTerm = $state("");
    let charCount = $state(0);
    let results: SearchResult[] | undefined = $state(undefined);
    let errorMessage = $state("");

    let debounceId: NodeJS.Timeout | null = null;

    function onSearchInput() {
        const term = searchTerm.trim();
        charCount++;

        if (debounceId) {
            clearTimeout(debounceId);
        }

        // If the term is empty, reset state
        if (term.length === 0) {
            charCount = 0;
            results = [];
            errorMessage = "";
            return;
        }

        // If we've typed enough characters, search immediately
        if (charCount >= DEBOUNCE_CHARS && term.length > 0) {
            charCount = 0;
            search(term);
            return;
        }

        debounceId = setTimeout(() => {
            search(term);
        }, DEBOUNCE_DELAY);
    }

    async function search(term: string) {
        results = undefined;
        errorMessage = "";

        try {
            const res = await fetch(
                `/stocks/search?term=${encodeURIComponent(term)}`
            );

            if (!res.ok) {
                errorMessage = `Request failed: ${res.status}`;
                return;
            }

            results = await res.json();
        } catch (error) {
            errorMessage = `Unknown error: ${error}`;
        }
    }
</script>

<input
    placeholder="Search stocks by name or symbol..."
    type="text"
    bind:value={searchTerm}
    oninput={onSearchInput}
/>

{#if searchTerm}
    {#if errorMessage}
        <p>{errorMessage}</p>
    {:else if results?.length ?? 1 > 0}
        <ul>
            {#each results as stock (stock.symbol)}
                <li>
                    <a href={resolve(`/stocks/${stock.symbol}`)}>
                        {stock.name} ({stock.symbol})
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
{/if}
