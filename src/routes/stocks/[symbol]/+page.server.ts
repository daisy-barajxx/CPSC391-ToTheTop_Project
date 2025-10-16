import type { PageServerLoad } from "./$types";
import { dummyStocks } from "$lib/server/dummyStocks";

export const load: PageServerLoad = async ({ params }) => {
    const symbol = params.symbol.toUpperCase();
    const stock = dummyStocks.find((s) => s.symbol === symbol);

    return{
        stock,
        symbol
    };
};
