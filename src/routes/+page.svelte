<script lang="ts">
    import type { SearchResult } from "$lib";
    import { resolve } from "$app/paths";
    import {
        formatChangeDisplay,
        formatCurrency,
        formatDate,
        formatPrice,
    } from "$lib/formatters";

    /** Time (ms) to delay search requests. */
    const DEBOUNCE_DELAY = 200;
    /** Num characters to trigger search.*/
    const DEBOUNCE_CHARS = 3;

    type Holding = {
        symbol: string;
        name: string;
        shares: number;
        price: number;
        dayPercent: number;
    };

    type PortfolioSnapshot = {
        investedValue: number;
        totalValue: number;
        dayChange: number;
        dayPercent: number;
    };

    type HoldingWithMetrics = Holding & {
        marketValue: number;
        dayChangeValue: number;
        changeDisplay: { text: string; color: string };
    };

    let searchTerm = $state("");
    let charCount = $state(0);
    let results: SearchResult[] | undefined = $state(undefined);
    let errorMessage = $state("");

    let holdings = $state<Holding[]>([
        {
            symbol: "AAPL",
            name: "Apple Inc.",
            shares: 1,
            price: 9999,
            dayPercent: 0.25,
        },
        {
            symbol: "NVDA",
            name: "NVIDIA Corp.",
            shares: 1,
            price: 8888,
            dayPercent: -0.32,
        },
        {
            symbol: "MSFT",
            name: "Microsoft Corp.",
            shares: 1,
            price: 7777,
            dayPercent: 0.18,
        },
        {
            symbol: "TSLA",
            name: "Tesla, Inc.",
            shares: 1,
            price: 6666,
            dayPercent: -0.44,
        },
    ]);
    let cashBalance = $state(1234);
    let lastRefreshed = $state(new Date());

    let snapshot = $derived.by(() =>
        createSnapshot(holdings, cashBalance)
    );
    let snapshotChange = $derived.by(() =>
        formatChangeDisplay(snapshot.dayChange, snapshot.dayPercent)
    );
    let holdingsWithMetrics = $derived.by(() =>
        holdings.map((holding) => {
            const marketValue = calcPositionValue(holding);
            const dayChangeValue = calcPositionDayChange(holding);

            return {
                ...holding,
                marketValue,
                dayChangeValue,
                changeDisplay: formatChangeDisplay(
                    dayChangeValue,
                    holding.dayPercent
                ),
            };
        })
    );

    let debounceId: NodeJS.Timeout | null = null;

    function calcPositionValue(holding: Holding): number {
        return holding.price * holding.shares;
    }

    function calcPositionDayChange(holding: Holding): number {
        return calcPositionValue(holding) * (holding.dayPercent / 100);
    }

    function createSnapshot(
        list: Holding[],
        cash: number
    ): PortfolioSnapshot {
        const investedValue = list.reduce(
            (total, holding) => total + calcPositionValue(holding),
            0
        );
        const dayChange = list.reduce(
            (total, holding) => total + calcPositionDayChange(holding),
            0
        );

        const dayPercent =
            investedValue === 0 ? 0 : (dayChange / investedValue) * 100;

        return {
            investedValue,
            totalValue: investedValue + cash,
            dayChange,
            dayPercent,
        };
    }

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

<main class="home-layout">
    <section class="pane search-pane">
        <header class="pane-header">
            <p class="eyebrow">Market lookup</p>
            <h2>Search stocks by name or symbol</h2>
            <p class="helper-text">
                Start typing to pull live matches. Keep an eye on your dashboard while
                you research.
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
        <aside class="pane portfolio-pane" aria-live="polite">
            <div class="portfolio-heading">
                <div>
                    <p class="eyebrow">Portfolio</p>
                    <h2>My dashboard</h2>
                </div>
                <p class="timestamp">Last updated {formatDate(lastRefreshed)}</p>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <p class="label">Total value</p>
                    <p class="value">{formatCurrency(snapshot.totalValue)}</p>
                    <p class="change" style="color:{snapshotChange.color}">
                        {snapshotChange.text}
                    </p>
                </div>
                <div class="summary-card">
                    <p class="label">Invested</p>
                    <p class="value">{formatCurrency(snapshot.investedValue)}</p>
                    <p class="helper-text">
                        Cash on hand: {formatCurrency(cashBalance)}
                    </p>
                </div>
            </div>

            <div class="positions-header">
                <h3>Positions</h3>
                <button type="button" class="ghost-button" aria-disabled="true">
                    Manage
                </button>
            </div>

            <div class="positions-table" role="region">
                {#if holdingsWithMetrics.length === 0}
                    <p class="empty-state">
                        You have no holdings yet. Search for a stock to add it once the
                        backend workflow is ready.
                    </p>
                {:else}
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Symbol</th>
                                <th scope="col">Shares</th>
                                <th scope="col">Price</th>
                                <th scope="col">Value</th>
                                <th scope="col">Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each holdingsWithMetrics as holding (holding.symbol)}
                                <tr>
                                    <td>
                                        <div class="symbol-cell">
                                            <span class="symbol">{holding.symbol}</span>
                                            <span class="company">{holding.name}</span>
                                        </div>
                                    </td>
                                    <td>{holding.shares}</td>
                                    <td>{formatPrice(holding.price)}</td>
                                    <td>{formatCurrency(holding.marketValue)}</td>
                                    <td style="color:{holding.changeDisplay.color}">
                                        {holding.changeDisplay.text}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
        </aside>
    </div>
</main>

<style>
    :global(:root) {
        --nav-height: 4rem;
    }

    main.home-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem clamp(1rem, 4vw, 3rem) 3rem;
        width: min(1200px, 100%);
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
        overflow: visible;
    }

    .dashboard-row {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .portfolio-pane {
        width: min(520px, 100%);
        align-self: flex-start;
    }

    .pane-header h2,
    .portfolio-heading h2 {
        margin: 0.25rem 0 0;
    }

    .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        margin: 0;
        color: var(--accent-dark);
    }

    .helper-text {
        margin: 0;
        font-size: 0.9rem;
        color: var(--accent-dark);
    }

    #search-input {
        padding: 1rem;
        font-size: 1.1rem;
        width: min(720px, 100%);
        border: 1px solid var(--primary-dark);
        border-radius: 0.5rem;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.08);
        align-self: flex-start;
    }

    #search-results-outer {
        width: min(720px, 100%);
        font-family: monospace;
        font-size: 1rem;
        align-self: flex-start;
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

    .portfolio-heading {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 1rem;
    }

    .timestamp {
        margin: 0;
        font-size: 0.85rem;
        color: var(--accent-dark);
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
    }

    .summary-card {
        border: 1px solid rgba(17, 21, 28, 0.1);
        border-radius: 0.75rem;
        padding: 1rem;
        background: var(--primary-light-2);
    }

    .label {
        margin: 0;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--accent-dark);
    }

    .value {
        margin: 0.25rem 0;
        font-size: 1.5rem;
    }

    .change {
        margin: 0;
        font-size: 0.95rem;
    }

    .positions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .positions-table {
        border: 1px solid rgba(17, 21, 28, 0.1);
        border-radius: 0.75rem;
        overflow: hidden;
        background: #fff;
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    thead {
        background-color: var(--primary-light-2);
    }

    th,
    td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(17, 21, 28, 0.1);
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    .symbol-cell {
        display: flex;
        flex-direction: column;
    }

    .symbol {
        font-weight: bold;
    }

    .company {
        font-size: 0.8rem;
        color: var(--accent-dark);
    }

    .ghost-button {
        border: 1px solid var(--primary-dark);
        background: transparent;
        color: var(--primary-dark);
        border-radius: 0.5rem;
        padding: 0.25rem 0.75rem;
        font-size: 0.85rem;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .empty-state {
        margin: 0;
        padding: 1rem;
        text-align: center;
        color: var(--accent-dark);
    }

    @media (max-width: 960px) {
        #search-input,
        #search-results-outer {
            width: 100%;
        }

        .dashboard-row {
            justify-content: center;
        }

        .portfolio-pane {
            width: 100%;
        }
    }
</style>
