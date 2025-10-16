import type { PageServerLoad } from "./$types";
import { dummyStocks } from "$lib/server/dummyStocks";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, fetch }) => {
    const symbol = params.symbol.toUpperCase();
    const stock = dummyStocks.find((s) => s.symbol === symbol);

    if (!stock) {
        throw error(400, "Stock does not exist.");
    }

    // TODO: Integrate into stock data
    const priceHistoryRaw: { date: string; close: number }[] = await (
        await fetch("/dummyDailyStock.json")
    ).json();

    const priceHistory = priceHistoryRaw.map((v) => {
        return [new Date(v.date), v.close];
    });

    return {
        stock,
        symbol,
        priceHistory,
    };
};
