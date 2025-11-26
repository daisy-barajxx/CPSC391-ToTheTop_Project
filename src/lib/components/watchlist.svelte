<script lang="ts">
    import { formatPrice, formatChangeDisplay } from "$lib/formatters";
    import type { WatchlistItem, StockOHLC } from "$lib";
    import { userState } from "$lib/user.svelte";

    interface WatchlistStock {
        symbol: string;
        name: string;
        currentPrice: number;
        priceChange: number;
        percentChange: number;
        miniHistory: number[];
    }

    let watchlistItems: WatchlistItem[] = $state([]);
    let stocksData: WatchlistStock[] = $state([]);
    let isLoading = $state(true);

    async function loadWatchlist() {
        if (!userState.user) {
            isLoading = false;
            return;
        }

        try {
            const response = await fetch('/api/watchlists');
            
            if (response.ok) {
                watchlistItems = await response.json();
                await loadAllStockData();
            } else {
                watchlistItems = [];
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
            watchlistItems = [];
        } finally {
            isLoading = false;
        }
    }

    async function loadAllStockData() {
        const promises = watchlistItems.map(item => loadStockData(item.stock));
        const results = await Promise.all(promises);
        stocksData = results.filter((stock): stock is WatchlistStock => stock !== null);
    }

    async function loadStockData(symbol: string): Promise<WatchlistStock | null> {
        try {
            const response = await fetch(`/api/stocks/${symbol}/history?range=5D`);
            
            if (!response.ok) {
                return null;
            }

            const ohlcData: StockOHLC = await response.json();

            ohlcData.ohlc = ohlcData.ohlc.map((d: any) => [
                new Date(d[0]),
                d[1],
                d[2],
                d[3],
                d[4],
            ]);

            if (ohlcData.ohlc.length === 0) {
                return null;
            }

            const firstClose = ohlcData.ohlc[0][4];
            const lastClose = ohlcData.ohlc[ohlcData.ohlc.length - 1][4];
            const priceChange = lastClose - firstClose;
            const percentChange = (priceChange / firstClose) * 100;
            const miniHistory = ohlcData.ohlc.map(d => d[4]);
            const searchRes = await fetch(`/stocks/search?term=${symbol}`);

            let name = symbol;
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.length > 0) {
                    name = searchData[0].name;
                }
            }

            return {
                symbol,
                name,
                currentPrice: lastClose,
                priceChange,
                percentChange,
                miniHistory,
            };
        } catch (error) {
            console.error(`Failed to load stock data for ${symbol}:`, error);
            return null;
        }
    }

    function createMiniChart(prices: number[]): string {
        if (!prices || prices.length < 2) return "";

        const max = Math.max(...prices);
        const min = Math.min(...prices);
        const range = max - min || 1;

        const width = 120;
        const height = 50;
        const padding = 2;

        const points = prices
            .map((price, i) => {
                const x = (i / (prices.length - 1)) * (width - 2 * padding) + padding;
                const y = height - ((price - min) / range) * (height - 2 * padding) - padding;
                return `${x},${y}`;
            })
            .join(" ");

        return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    }

    $effect(() => {
        loadWatchlist();
    });
</script>

<div class="watchlist-container">
    <h2>Watchlist</h2>
    
    {#if !userState.user}
        <div class="auth-required">
            <p>Please log in to view your watchlist</p>
            <a href="/login" class="login-link">Log In</a>
        </div>
    {:else if isLoading}
        <p class="loading-message">Loading watchlist...</p>
    {:else if stocksData.length === 0}
        <p class="empty-message">Your watchlist is empty.</p>
    {:else}
        <div class="watchlist-grid">
            {#each stocksData as stock (stock.symbol)}
                {@const isPositive = stock.percentChange >= 0}
                {@const change = formatChangeDisplay(stock.priceChange, stock.percentChange)}
                <a href="/stocks/{stock.symbol}" class="watchlist-card" class:positive={isPositive} class:negative={!isPositive}>
                    <div class="stock-info">
                        <div class="symbol">{stock.symbol}</div>
                        <div class="name">{stock.name}</div>
                    </div>
                    
                    <div class="mini-chart" class:chart-positive={isPositive} class:chart-negative={!isPositive}>
                        {@html createMiniChart(stock.miniHistory)}
                    </div>
                    
                    <div class="price-info">
                        <div class="price">${formatPrice(stock.currentPrice)}</div>
                        <div class="change" style="color: {change.color}">
                            {change.text}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

<style>
    .watchlist-container {
        width: 100%;
    }

    h2 {
        margin: 0 0 1.5rem 0;
        font-size: 2rem;
        color: var(--primary-dark);
    }
    .auth-required {
        text-align: center;
        padding: 3rem 2rem;
        background-color: var(--primary-light);
        border: 2px solid var(--primary-dark);
        border-radius: 1rem;
    }

    .auth-required p {
        font-size: 1.2rem;
        color: var(--primary-dark);
        margin-bottom: 1.5rem;
    }

    .login-link {
        display: inline-block;
        padding: 0.75rem 2rem;
        background-color: var(--accent-primary);
        color: white;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .login-link:hover {
        background-color: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .loading-message {
        text-align: center;
        color: var(--primary-dark);
        opacity: 0.7;
        padding: 2rem;
        font-size: 1.1rem;
    }

    .empty-message {
        text-align: center;
        color: var(--primary-dark);
        opacity: 0.7;
        padding: 2rem;
    }

    .watchlist-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .watchlist-card {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 1rem;
        text-decoration: none;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .watchlist-card.positive {
        background: linear-gradient(135deg, #1a4d1a 0%, #2d7a2d 100%);
    }

    .watchlist-card.negative {
        background: linear-gradient(135deg, #7a1a1a 0%, #a82828 100%);
    }

    .watchlist-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .stock-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .symbol {
        font-size: 2.5rem;
        font-weight: bold;
        font-family: monospace;
        line-height: 1;
    }

    .name {
        font-size: 0.9rem;
        opacity: 0.9;
        line-height: 1.2;
    }

    .mini-chart {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .mini-chart.chart-positive {
        color: #00ff00;
    }

    .mini-chart.chart-negative {
        color: #ff0000;
    }

    .price-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
        text-align: right;
    }

    .price {
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1;
    }

    .change {
        font-size: 1rem;
        font-weight: 600;
        opacity: 0.95;
    }

    @media (max-width: 1024px) {
        .watchlist-card {
            grid-template-columns: 1fr auto auto;
            padding: 1rem;
        }

        .symbol {
            font-size: 2rem;
        }

        .name {
            font-size: 0.8rem;
        }

        .price {
            font-size: 1.2rem;
        }

        .mini-chart {
            display: none;
        }
    }
</style>
