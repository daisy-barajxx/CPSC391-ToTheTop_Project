import type { PageServerLoad } from "./$types";
import { dummyStocks } from "$lib/server/dummyStocks";
import { error } from "@sveltejs/kit";
import type { Stock, StockOHLC } from "$lib";
import {getStockInfo, getHistory} from "$lib/server/polygon"

interface RawOHLC {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
    const symbol = params.symbol.toUpperCase();

    // TODO: Replace with real stock data --DONE
    const stock = getStockInfo(symbol);
   
   /*const stock = dummyStocks.find((s) => s.symbol === symbol) as Stock | undefined;
  if (!stock) {
    throw error(400, "Stock does not exist.");
  }*/

    // TODO: Replace with real stock price history data --DONE
    const priceHistoryRaw = await getHistory(symbol, "2025-10-10", "2025-10-26");
    
    //const priceHistoryRaw = await (await fetch("/aapl-ohlc-data.json")).json();

    // We know ahead of time the timespan is "day" and went from 2025-10-15 as far back as possible

    const priceHistory: StockOHLC = {
        symbol: priceHistoryRaw.ticker,
        timespan: "day",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ohlc: priceHistoryRaw.results!.map((v: any) => {
            return [new Date(v.t), v.o, v.h, v.l, v.c];
        }),
    };

    return {
        stock,
        symbol,
        priceHistory,
    };
};