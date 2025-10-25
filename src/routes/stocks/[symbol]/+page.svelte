<script lang="ts">
    import type { PageProps } from "./$types";
    import { formatDate, formatPrice, formatChangeDisplay } from "$lib/formatters";
    import * as Plot from "@observablehq/plot";
    import { TimeRange } from "$lib";

    let { data }: PageProps = $props();
    const { stock, symbol, priceHistory } = data;

    let priceDiv: HTMLElement | undefined = $state();
    let timerange = $state(TimeRange["1M"]);

    const change = formatChangeDisplay(stock.priceChange, stock.percentChange);

    function timeRangeDate(range: TimeRange): Date {
        // TODO: Replace with current date`
        const now = Date.now();
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
        const filtered = priceHistory.ohlc.filter((d) => d[0] >= startDate);

        // FIXME: Plot displays dates in UTC, and cannot be easily forced to use eastern time
        const plot = Plot.line(
            filtered.map((d) => [d[0], d[4]]),
            {
            stroke: stock.percentChange > 0 ? "green" : stock.percentChange < 0 ? "red" : "gray",
            tip: true,
             }
        );

        priceDiv?.append(
            plot.plot({
                x: { label: "Date" },
                y: { label: "Close Price", grid: true, },
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
    <span class="stock-name">{stock.name}</span>
  </div>

  <!-- Price + change -->
  <div class="price-row">
    USD {formatPrice(stock.price)}
    <span style="color:{change.color}">{change.text}</span>
  </div>

  <!-- Graph -->
  <div class="graph">
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
