import { TimeRange } from "$lib";
import { getStockHistory } from "$lib/server/polygon";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, url }) => {
    const symbol = params.symbol!.toUpperCase();
    const range = url.searchParams.get("range");

    if (TimeRange[range as keyof typeof TimeRange] === undefined) {
        throw Error("Invalid time range");
    }

    return json(
        await getStockHistory(
            symbol,
            TimeRange[range as keyof typeof TimeRange]
        )
    );
};
