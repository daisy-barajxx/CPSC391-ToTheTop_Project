/**
 * Ranges of time for fetching stock data.
 */
export enum TimeRange {
    "1D" = "1D",
    "5D" = "5D",
    "1M" = "1M",
    "3M" = "3M",
    "6M" = "6M",
    "1Y" = "1Y",
    "MAX" = "MAX",
}

/**
 * A search result for a stock.
 */
export interface SearchResult {
    /** Stock symbol. */
    symbol: string;
    /** Stock name. */
    name: string;
}

/**
 * Basic stock information.
 */
export interface Stock {
    /** Stock symbol. */
    symbol: string;
    /** Stock name. */
    name: string;
    /** Current stock price (USD). */
    price: number;
    /** Price change since ??? (USD). */
    priceChange: number;
    /** Percent price change since ???. */
    percentChange: number;
}

/**
 * The Open, High, Low, and Close data for a stock over time.
 */
export interface StockOHLC {
    /** Stock symbol. */
    symbol: string;
    /**
     * The size of each time interval in the OHLC data.
     */
    timespan: "minute" | "hour" | "day" | "week";
    /**
     * OHLC data points. Each entry is an array containing:
     * - Date
     * - Open price
     * - High price
     * - Low price
     * - Close price
     *
     * Data points are sorted in ascending order by date.
     */
    ohlc: [Date, number, number, number, number][];
}

/**
 * Represents a single entry in a user's stock watchlist.
 */
export interface WatchlistItem {
    /** Unique identifier for the watchlist entry. */
    id: string;
    /** User ID who owns this watchlist item. */
    userId: string;
    /** Stock symbol. */
    stock: string;
}
