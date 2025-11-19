import { SESSION_COOKIE_NAME, validateSessionToken } from "$lib/server/auth";
import {
    addToWatchlist,
    isInWatchlist,
    removeFromWatchlist,
} from "$lib/server/watchlists";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies, params }) => {
    if (!params.symbol) {
        throw error(400, "Stock symbol is required.");
    }

    const token = cookies.get(SESSION_COOKIE_NAME);
    const session = await validateSessionToken(token ?? "");

    if (!session) {
        throw error(401, "Unauthenticated");
    }

    const result = await isInWatchlist(session.userId, params.symbol);

    return json(result);
};

export const POST: RequestHandler = async ({ cookies, params }) => {
    if (!params.symbol) {
        throw error(400, "Stock symbol is required.");
    }

    const token = cookies.get(SESSION_COOKIE_NAME);
    const session = await validateSessionToken(token ?? "");

    if (!session) {
        throw error(401, "Unauthenticated");
    }

    const result = await addToWatchlist(session.userId, params.symbol);

    if (result == null) {
        throw error(400, "Stock already in watchlist.");
    }

    return json(result);
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
    if (!params.symbol) {
        throw error(400, "Stock symbol is required.");
    }

    const token = cookies.get(SESSION_COOKIE_NAME);
    const session = await validateSessionToken(token ?? "");

    if (!session) {
        throw error(401, "Unauthenticated");
    }

    return json(await removeFromWatchlist(session.userId, params.symbol));
};
