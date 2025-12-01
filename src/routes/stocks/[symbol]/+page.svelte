<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatPrice, formatChangeDisplay } from "$lib/formatters";
    import WatchlistButton from "$lib/components/watchlistButton.svelte";
    import * as Plot from "@observablehq/plot";
    import { TimeRange } from "$lib";

    let { data }: PageProps = $props();
    const { symbol, name, ohlcHistory } = data;

    let priceDiv: HTMLElement | undefined = $state();
    let showPrice0 = $state(false);
    let timerange = $state(TimeRange["1M"]);
    let ohlcHistoryState = $state(ohlcHistory);

    let priceChange = $derived.by(() => {
        return (
            ohlcHistoryState.ohlc[ohlcHistoryState.ohlc.length - 1][4] -
            ohlcHistoryState.ohlc[0][4]
        );
    });
    let percentChange = $derived.by(() => {
        return (priceChange / ohlcHistoryState.ohlc[0][4]) * 100;
    });
    let change = $derived(formatChangeDisplay(priceChange, percentChange));

    async function updateOHLCHistory() {
        const res = await fetch(
            `/api/stocks/${symbol}/history?range=${timerange}`
        );

        if (res.ok) {
            const data = await res.json();

            // Need to convert timestamps to Date objects since JSON turns them into strings
            data.ohlc = data.ohlc.map((d: any) => [
                new Date(d[0]),
                d[1],
                d[2],
                d[3],
                d[4],
            ]);

            ohlcHistoryState = data;
        } else {
            console.error(
                `Failed to fetch OHLC history: ${res.status} ${res.statusText}`
            );
        }
    }

    // Price chart
    $effect(() => {
        // Remove the old plot if it exists
        priceDiv?.firstChild?.remove();

        // FIXME: Plot displays dates in UTC, and cannot be easily forced to use eastern time
        const plotData = ohlcHistoryState.ohlc.map((d) => {
            return { Date: d[0], Close: d[4] };
        });
        const min = plotData.toSorted((a, b) => a.Close - b.Close)[0];

        const plotLine = Plot.line(plotData, {
            x: "Date",
            y: "Close",
            stroke:
                percentChange > 0
                    ? "var(--money-positive)"
                    : percentChange < 0
                      ? "var(--money-negative)"
                      : "var(--money-neutral)",
            strokeWidth: 2,
            tip: true,
        });

        const plotArea = Plot.areaY(plotData, {
            x: "Date",
            y: "Close",
            y1: showPrice0 ? undefined : min.Close,
            fill:
                percentChange >= 0
                    ? "var(--money-positive)"
                    : "var(--money-negative)",
            fillOpacity: 0.3,
        });

        priceDiv?.append(
            Plot.plot({
                x: { label: "Date" },
                y: { label: "Close Price", grid: true },
                width: 1280,
                marks: [
                    plotArea,
                    plotLine,
                    showPrice0 ? Plot.ruleY([0]) : null,
                ],
            })
        );
    });
</script>

<main>
    <!-- Symbol + name + watchlist button-->
     <div id = "header-row">
        <div id="symbol-row">
            <span id="symbol-box"><b>{symbol}</b></span>
            <span id="stock-name">{name}</span>
        </div>
            <WatchlistButton {symbol} />
        </div>

    <div id="outer">
        <div id="price-info">
            <!-- <div class="date">{formatDate(new SvelteDate())}</div> -->

            <!-- Price + change -->
            <div class="price-row">
                {formatPrice(
                    ohlcHistoryState.ohlc[ohlcHistoryState.ohlc.length - 1][4]
                )}
                <span class="currency">USD</span>
                <span style="color:{change.color}">{change.text}</span>
            </div>

            <div id="graph-outer">
                <h2>Price Chart</h2>
                {#each Object.values(TimeRange) as range (range)}
                    <button
                        onclick={() => {
                            timerange = range;
                            updateOHLCHistory();
                        }}
                        class:active={timerange === range}
                    >
                        {range}
                    </button>
                {/each}

                <button
                    onclick={() => (showPrice0 = !showPrice0)}
                    class:active={showPrice0}
                >
                    {showPrice0 ? "Absolute" : "Relative"} Price
                </button>

                <div id="graph" bind:this={priceDiv} role="img"></div>
            </div>
        </div>

        <div id="company-info"></div>
    </div>
</main>

<style>
    main {
        margin: 2rem 1rem;
    }

    #header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    #outer {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
    }

    #symbol-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 3rem;
        font-family: monospace;
    }

    #symbol-box {
        box-sizing: border-box;
        border: 2px solid var(--primary-dark);
        padding: 0.25rem 0.5rem;
        display: inline-block;
    }

    .price-row {
        margin: 1rem 0;
        font-size: 1.5rem;
    }
    .currency {
        color: var(--accent-dark);
        font-size: 1rem;
    }

    #graph-outer > #graph {
        margin-top: 2rem;
    }

    #graph-outer > button {
        padding: 0.25rem 0.5rem;
        margin-right: 0.5rem;
        background-color: var(--primary-light);
        border: 2px solid var(--primary-dark);
        border-radius: 0.25rem;
        font-size: medium;
        color: var(--primary-dark);
    }

    #graph-outer > button:hover {
        color: var(--accent-primary);
        border: 2px solid var(--accent-primary);
        border-radius: 0rem;
        cursor: pointer;
    }

    #graph-outer > button.active {
        background-color: var(--primary-dark);
        color: var(--primary-light);
    }
</style>
