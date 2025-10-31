import {
    GetStocksAggregatesTimespanEnum,
    restClient,
} from "@polygon.io/client-js";
import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";
import type { StockOHLC, TimeRange } from "$lib";

const rest = restClient(env.API_KEY!, "https://api.polygon.io");

export async function getStockInfo(symbol: string) {
    const response = await getStock(symbol);

    const ticker = response.ticker;
    let open, close;
    let priceChange, percentChange;

    if (response.results) {
        open = response.results[0].o;
        close = response.results[0].c;

        priceChange = close - open;
        percentChange = (priceChange / open) * 100;
    } else {
        open = null;
        close = null;
        priceChange = 0;
        percentChange = 0;
    }

    return {
        ticker,
        symbol,
        priceChange,
        percentChange,
    };
}

//Used to get stock info in place of dummy stocks (ticker, symbol, priceChange, percentChange)
async function getStock(symbol: string) {
    try {
        //Gets previous days data
        const response = await rest.getPreviousStocksAggregates(symbol, true);
        return response;
    } catch {
        throw error(400, "Date inacessible.");
    }
}

export async function getStockHistory(symbol: string, timeRange: TimeRange) {
    const now = Date.now();

    let timespanEnum = GetStocksAggregatesTimespanEnum.Day;
    let timeMultiplier = 1;
    let daysToSubtract: number;

    switch (timeRange) {
        case "1D":
            daysToSubtract = 1;
            timeMultiplier = 5;
            timespanEnum = GetStocksAggregatesTimespanEnum.Minute;
            break;
        case "5D":
            daysToSubtract = 5;
            timeMultiplier = 30;
            timespanEnum = GetStocksAggregatesTimespanEnum.Minute;
            break;
        case "1M":
            daysToSubtract = 30;
            break;
        case "3M":
            daysToSubtract = 90;
            break;
        case "6M":
            daysToSubtract = 180;
            break;
        case "1Y":
            daysToSubtract = 365;
            break;
        case "MAX":
            daysToSubtract = 7300; // 20 years, much longer than we can access
            break;
        default:
            throw new Error("Invalid time range");
    }

    const startDate = new Date(now - daysToSubtract * 24 * 60 * 60 * 1000);

    try {
        const res = await rest.getStocksAggregates(
            symbol,
            timeMultiplier,
            timespanEnum,
            startDate.valueOf().toString(),
            now.toString(),
            true
        );

        const ohlc: StockOHLC = {
            symbol: res.ticker,
            timespan: timespanEnum,
            ohlc:
                res.results?.map((v) => {
                    return [new Date(v.t), v.o, v.h, v.l, v.c];
                }) ?? [],
        };

        return ohlc;
    } catch (e) {
        throw Error(`Failed to fetch stock history: ${e}`);
    }
}
