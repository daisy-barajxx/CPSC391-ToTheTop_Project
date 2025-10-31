<script lang="ts">
    import type { PageProps } from "./$types";
    import {
        formatDate,
        formatPrice,
        formatChangeDisplay,
    } from "$lib/formatters";
    import * as Plot from "@observablehq/plot";
    import { TimeRange } from "$lib";

    let { data }: PageProps = $props();
    const { symbol, name, ohlcHistory } = data;

    let priceDiv: HTMLElement | undefined = $state();
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

            data.ohlc = data.ohlc.map((d: any) => [
                new Date(d[0]),
                d[1],
                d[2],
                d[3],
                d[4],
            ]);

            // Need to convert timestamps to Date objects since JSON turns them into strings
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

        console.log(typeof ohlcHistory.ohlc[0][0]);

        // FIXME: Plot displays dates in UTC, and cannot be easily forced to use eastern time
        const plot = Plot.line(
            ohlcHistoryState.ohlc.map((d) => [d[0], d[4]]),
            {
                stroke:
                    percentChange > 0
                        ? "green"
                        : percentChange < 0
                          ? "red"
                          : "gray",
                tip: true,
            }
        );

        priceDiv?.append(
            plot.plot({
                x: { label: "Date" },
                y: { label: "Close Price", grid: true },
            })
        );
    });
</script>

<main>
    <!-- Date -->
    <div class="date">{formatDate(new Date())}</div>

    <!-- Symbol + name -->
    <div class="symbol-row">
        <span class="symbol-box"><b>{symbol}</b></span>
        <span class="stock-name">{name}</span>
    </div>

    <!-- Price + change -->
    <div class="price-row">
        USD {formatPrice(
            ohlcHistoryState.ohlc[ohlcHistoryState.ohlc.length - 1][4]
        )}
        <span style="color:{change.color}">{change.text}</span>
    </div>

    <!-- Graph -->
    <div class="graph">
        <h2>Price Chart</h2>
        {#each Object.values(TimeRange) as range}
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

        <div bind:this={priceDiv} role="img"></div>
    </div>
</main>

<style>
    .stock-detail {
        text-align: center;
        margin-top: 20px;
    }

    .date {
        margin-bottom: 10px;
        font-size: 1.7em;
        color: #555;
    }

    .symbol-row {
        margin: 10px 0;
    }

    .symbol-box {
        border: 2px solid black;
        padding: 4px 10px;
        margin-right: 8px;
        display: inline-block;
        font-size: 3rem;
    }

    .stock-name {
        font-size: 3rem;
    }

    .price-row {
        margin: 10px 0;
        font-size: 1.5em;
    }

    .graph {
        margin-top: 20px;
        width: 100%;
        margin-left: auto;
        margin-right: auto;
    }

    button.active {
        font-weight: bold;
    }
</style>
