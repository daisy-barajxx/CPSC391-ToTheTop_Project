import { search } from "$lib/server/search";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const term = url.searchParams.get("term");

    if (!term) {
        error(400, "A search term must be supplied");
    }

    return json(await search(term));
};
