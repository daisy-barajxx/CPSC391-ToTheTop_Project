<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatPrice, formatCurrency, getArrow } from "$lib/formatters";
    import * as Plot from "@observablehq/plot";
    import { TimeRange } from "$lib";

    let { data }: PageProps = $props();
    const { stock, symbol, priceHistory } = data;

    let priceDiv: HTMLElement | undefined = $state();
    let timerange = $state(TimeRange["1M"]);

    const arrow = getArrow(stock.percentChange);
    const isPositive = stock.percentChange > 0;
    const isNegative = stock.percentChange < 0;
    const changeClass = isPositive
        ? "positive"
        : isNegative
          ? "negative"
          : "neutral";

    function timeRangeDate(range: TimeRange): Date {
        // TODO: Replace with current date`
        const now = new Date("2025-10-15").valueOf();

        let daysToSubtract: number;

        switch (range) {
            case TimeRange["1D"]:
                daysToSubtract = 1;
                break;
            case TimeRange["5D"]:
                daysToSubtract = 5;
                break;
            case TimeRange["1M"]:
                daysToSubtract = 30;
                break;
            case TimeRange["3M"]:
                daysToSubtract = 90;
                break;
            case TimeRange["6M"]:
                daysToSubtract = 180;
                break;
            case TimeRange["1Y"]:
                daysToSubtract = 365;
                break;
            case TimeRange["MAX"]:
                return new Date(2000, 0, 0); // Date earlier than any data we can access
        }

        return new Date(now - daysToSubtract * 86400 * 1000);
    }

    $effect(() => {
        // Remove the old plot if it exists
        priceDiv?.firstChild?.remove();

        // TODO: Replace with real data fetching based on timerange

        const startDate = timeRangeDate(timerange);
        const data = priceHistory.ohlc.filter((d) => d[0] >= startDate);

        // FIXME: Plot displays dates in UTC, and cannot be easily forced to use eastern time
        const plot = Plot.line(
            data.map((d) => [d[0], d[4]]),
            {
                stroke: isPositive ? "green" : isNegative ? "red" : "gray",
                tip: true,
            }
        );

        priceDiv?.append(
            plot.plot({
                x: {
                    label: "Date",
                },
                y: {
                    label: "Close Price",
                    grid: true,
                },
            })
        );
    });
</script>

<main>
    <div>
        <h1>{symbol}</h1>
        <p>{stock.name}</p>
    </div>

    <div>
        <div>
            <p>USD</p>
            <p>{formatPrice(stock.price)}</p>
        </div>

        <div>
            <span class={changeClass}>
                {arrow.symbol}
            </span>

            <span class={changeClass}>
                {formatCurrency(Math.abs(stock.priceChange))}
            </span>

            <span class={changeClass}>
                ({Math.abs(stock.percentChange).toFixed(2)}%)
            </span>
        </div>
    </div>

    <div>
        <h2>Price Chart</h2>

        {#each Object.values(TimeRange) as range}
            <button
                onclick={() => (timerange = range)}
                class:active={timerange === range}
            >
                {range}
            </button>
        {/each}

        <div bind:this={priceDiv} role="img"></div>
    </div>
</main>

<style>
    .positive {
        color: green;
    }

    .negative {
        color: red;
    }

    .neutral {
        color: gray;
    }

    button.active {
        font-weight: bold;
    }
</style>
