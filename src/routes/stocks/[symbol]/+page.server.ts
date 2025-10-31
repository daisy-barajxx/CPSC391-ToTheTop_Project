import type { PageServerLoad } from "./$types";
import { TimeRange } from "$lib";
import { getStockHistory } from "$lib/server/polygon";
import { getSymbolName } from "$lib/server/search";

export const load: PageServerLoad = async ({ params }) => {
    const symbol = params.symbol.toUpperCase();

    const name = await getSymbolName(symbol);
    const ohlcHistory = await getStockHistory(symbol, TimeRange["1M"]);

    return {
        symbol,
        name,
        ohlcHistory,
    };
};
