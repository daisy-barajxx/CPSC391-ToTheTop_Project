import { SESSION_COOKIE_NAME, validateSessionToken } from "$lib/server/auth";
import { getWatchlist } from "$lib/server/watchlists";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get(SESSION_COOKIE_NAME);
    const session = await validateSessionToken(token ?? "");

    if (!session) {
        throw error(401, "Unauthenticated");
    }

    return json(await getWatchlist(session.userId));
};
