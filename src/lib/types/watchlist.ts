/**
    Watchlist item interface
 */
export interface WatchlistItem {
    /** Unique identifier for the watchlist entry */
    id: number;
    /** User ID who owns this watchlist item */
    userId: number;
    /** Stock symbol. */
    symbol: string;
    /** Stock name. */
    name: string;
    /** Order/position in the watchlist */
    position: number;
    /** When the item was added */
    addedAt: Date;
}

/**
    Watchlist item with current price data
 */
export interface WatchlistItemWithPrice extends WatchlistItem {
    /** Current stock price. */
    currentPrice: number;
    /** Price change since market open */
    priceChange: number;
    /** Percent change since market open */
    percentChange: number;
}
