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

<main>
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
                                <div
                                    style="display: flex; justify-content: space-between;"
                                >
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
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #search-input {
        padding: 1rem 0.25rem;
        margin-top: 10rem;
        margin-bottom: 1rem;
        font-size: large;
        width: 50%;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5em;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    }

    #search-results-outer {
        width: 50%;
        font-family: monospace;
        font-size: x-large;
    }

    #search-results {
        box-sizing: border-box;
        list-style: none;
        margin: 0;
        padding: 1rem;
        border: 1px solid var(--primary-dark);
        border-radius: 0.5em;

        a {
            text-decoration: none;
            color: inherit;

            div {
                transition: all 0.1s ease-in-out;
                padding: 1rem 0;
            }
        }

        a:hover {
            div {
                transition: all 0.1s ease-in-out;
                background-color: var(--primary-light-2);
            }
        }

        li:not(:last-child) {
            border-bottom: 1px solid var(--primary-dark);
        }
    }

    #search-no-results,
    #search-error {
        padding: 1rem;
        text-align: center;
    }
</style>
