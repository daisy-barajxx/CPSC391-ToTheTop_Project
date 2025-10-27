import type { PageServerLoad } from "./$types";
import { dummyStocks } from "$lib/server/dummyStocks";
import { error } from "@sveltejs/kit";
import type { Stock, StockOHLC } from "$lib";

import { GetStocksAggregatesSortEnum, GetStocksAggregatesTimespanEnum, restClient } from "@polygon.io/client-js";

const apiKey = "KNugSCBuDCeuAw28nz3pgvpj8iopDqoz";
const rest = restClient(apiKey, "https://api.polygon.io");

interface RawOHLC {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
    const symbol = params.symbol.toUpperCase();

    // TODO: Replace with real stock data
    //const stock = getStockInfo(symbol);
   
   const stock = dummyStocks.find((s) => s.symbol === symbol) as Stock | undefined;
  if (!stock) {
    throw error(400, "Stock does not exist.");
  }

    // TODO: Replace with real stock price history data
    const priceHistoryRaw = await getDateInfo(symbol, "2025-10-10", "2025-10-26");
    
    //const priceHistoryRaw = await (await fetch("/aapl-ohlc-data.json")).json();

    // We know ahead of time the timespan is "day" and went from 2025-10-15 as far back as possible

    const priceHistory: StockOHLC = {
        symbol: priceHistoryRaw.ticker,
        timespan: "day",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ohlc: priceHistoryRaw?.results.map((v: any) => {
            return [new Date(v.t), v.o, v.h, v.l, v.c];
        }),
    };

    return {
        stock,
        symbol,
        priceHistory,
    };
};


async function getStockName(symbol : string) {
  try {
    const response = await rest.getTicker(symbol);
    return response;
  } catch (e) {
    throw error(400, "Stock does not exist.");
  }
}



async function getDateInfo(symbol: string, startDate: string, endDate : string) {
  try {
    const response = await rest.getStocksAggregates(
      symbol,
      1,
      GetStocksAggregatesTimespanEnum.Day,
      startDate,
      endDate,
      true
    );
    return response;
  } catch (e) {
    throw error(400, "Date inacessible.");
  }
}