/**
 * Ranges of time for fetching stock data.
 */
export type TimeRange = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "MAX";

export interface SearchResult {
    symbol: string;
    name: string;
}

export interface Stock {
    symbol: string;
    name: string;
    price: number;
    priceChange: number;
    percentChange: number;
}

/**
 * The Open, High, Low, and Close data for a stock over time.
 */
export interface StockOHLC {
    /** Ticker symbol. */
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
