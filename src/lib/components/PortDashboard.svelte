<script lang="ts">
    import {
        formatChangeDisplay,
        formatCurrency,
        formatDate,
        formatPrice,
    } from "$lib/formatters";
    import "./PortDashboard.css";

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

    const demoHoldings: Holding[] = [
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
    ];

    let {
        holdings: holdingsProp = demoHoldings,
        cashBalance: cashProp = 1234,
        lastRefreshed: refreshedProp = new Date(),
    } = $props();

    let holdings = $state(holdingsProp);
    let cashBalance = $state(cashProp);
    let lastRefreshed = $state(refreshedProp);

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
</script>

<section class="portfolio-pane" aria-live="polite">
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
</section>
