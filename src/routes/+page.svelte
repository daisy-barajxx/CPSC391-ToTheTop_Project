<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";
    import PortDashboard from "$lib/components/PortDashboard.svelte";

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

        if (term.length === 0) {
            charCount = 0;
            results = undefined;
            errorMessage = "";
            return;
        }

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

<main class="home-layout">
    <section class="pane search-pane">
        <header class="pane-header">
            <p class="eyebrow">Market lookup</p>
            <h2>Search stocks by name or symbol</h2>
            <p class="helper-text">
                Start typing to pull live matches. Keep an eye on your dashboard while
                you search.
            </p>
        </header>

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
                                    <div class="result-row">
                                        <span>{stock.name}</span>
                                        <span>({stock.symbol})</span>
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
    </section>

    <div class="dashboard-row">
        <div class="dashboard-pane">
            <PortDashboard />
        </div>
    </div>
</main>

<style>
    main.home-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem clamp(1rem, 4vw, 3rem) 3rem;
        width: min(1320px, 100%);
        margin: 0 auto 4rem;
        box-sizing: border-box;
    }

    .pane {
        border: 1px solid rgba(17, 21, 28, 0.1);
        border-radius: 0.75rem;
        padding: 1.75rem;
        box-sizing: border-box;
        background-color: var(--primary-light);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .search-pane {
        align-items: center;
    }

    .search-pane > * {
        width: 100%;
        max-width: 720px;
    }

    .dashboard-row {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }

    .dashboard-pane {
        width: min(520px, 100%);
    }

    .pane-header h2 {
        margin: 0.25rem 0 0;
    }

    .helper-text {
        margin: 0;
        font-size: 0.9rem;
        color: var(--accent-dark);
        max-width: 48ch;
    }

    #search-input {
        padding: 1rem;
        font-size: 1.1rem;
        width: 100%;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5rem;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.08);
    }

    #search-results-outer {
        width: 100%;
        font-family: monospace;
        font-size: 1rem;
    }

    #search-results {
        box-sizing: border-box;
        list-style: none;
        margin: 0.5rem 0 0;
        padding: 0.5rem;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5rem;
    }

    #search-results a {
        text-decoration: none;
        color: inherit;
    }

    .result-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0.5rem;
        transition: background-color 0.1s ease-in-out;
    }

    #search-results a:hover .result-row {
        background-color: var(--primary-light-2);
    }

    #search-results li:not(:last-child) {
        border-bottom: 1px solid var(--primary-dark);
    }

    #search-no-results,
    #search-error {
        padding: 1rem;
        text-align: center;
    }

    @media (max-width: 1050px) {
        .dashboard-row {
            justify-content: center;
        }
    }

    @media (max-width: 720px) {
        .search-pane > * {
            max-width: 100%;
        }
    }
</style>
