<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";
    import Watchlist from "$lib/components/watchlist.svelte";

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
            results = undefined;
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

<div class="page-container">
    <div class="search-section">
        <input
            id="search-input"
            placeholder="Search stocks by name or symbol..."
            type="text"
            aria-label="Search stocks"
            bind:value={searchTerm}
            oninput={onSearchInput}
            autocomplete="off"
        />

        {#if searchTerm}
            <div id="search-results-outer">
                {#if errorMessage}
                    <p id="search-error">{errorMessage}</p>
                {:else if results && results.length > 0}
                    <ul id="search-results">
                        {#each results as stock (stock.symbol)}
                            <li>
                                <a href={resolve(`/stocks/${stock.symbol}`)}>
                                    <div class="search-result-item">
                                        <span class="result-name">{stock.name}</span>
                                        <span class="result-symbol">({stock.symbol})</span>
                                    </div>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {:else if results && results.length === 0}
                    <p id="search-no-results">No results found.</p>
                {/if}
            </div>
        {/if}
    </div>

    <aside class="watchlist-sidebar">
        <Watchlist />
    </aside>
</div>

<style>

    .page-container {
        padding: 2rem;
        min-height: calc(100vh - 5rem);
        position: relative;
    }

    .search-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-bottom: 3rem;
        min-height: 160px;
    }

    #search-input {
        padding: 1rem 0.25rem;
        font-size: large;
        width: 70%;
        max-width: 900px;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5em;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    }

    #search-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
    }

    #search-results-outer {
        width: 70%;
        max-width: 900px;
        margin-top: 1rem;
        position: relative;
        z-index: 100;
    }

    #search-results {
        box-sizing: border-box;
        list-style: none;
        margin: 0;
        padding: 1rem;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5em;
        background-color: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: absolute;
        width: 100%;
        font-family: monospace;
        font-size: x-large;
    }

    #search-results a {
        text-decoration: none;
        color: inherit;
    }

    .search-result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    #search-results a:hover .search-result-item {
        background-color: var(--primary-light-2);
    }

    .result-name {
        font-size: inherit;
    }

    .result-symbol {
        font-family: monospace;
        font-size: inherit;
    }

    #search-results li:not(:last-child) .search-result-item {
        border-bottom: 1px solid var(--primary-dark);
    }

    #search-no-results,
    #search-error {
        padding: 1rem;
        text-align: center;
        background-color: white;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5em;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    }

    .watchlist-sidebar {
        max-width: 450px;
        position: relative;
    }

    @media (max-width: 1024px) {
        .page-container {
            padding: 1rem;
        }

        .search-section {
            margin-bottom: 2rem;
        }

        #search-input,
        #search-results-outer {
            width: 95%;
        }

        .watchlist-sidebar {
            max-width: 100%;
        }
    }
</style>
