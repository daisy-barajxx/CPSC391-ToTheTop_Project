<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatPrice, formatCurrency, getArrow } from "$lib/formatters";
    import * as Plot from "@observablehq/plot";

    let { data }: PageProps = $props();
    const { stock, symbol, priceHistory } = data;

    let priceDiv: HTMLElement | undefined = $state();

    const arrow = getArrow(stock.percentChange);
    const isPositive = stock.percentChange > 0;
    const isNegative = stock.percentChange < 0;
    const changeClass = isPositive
        ? "positive"
        : isNegative
          ? "negative"
          : "neutral";

    $effect(() => {
        const plot = Plot.line(priceHistory);

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
</style>
