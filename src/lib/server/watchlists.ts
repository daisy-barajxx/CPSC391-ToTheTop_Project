import type { WatchlistItem } from "$lib";
import postgres from "postgres";
import db from "./db";

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const res = await db`SELECT * FROM watchlists WHERE user_id = ${userId}`;

    return res.map((item) => {
        return {
            stock: item.stock,
            userId: item.user_id,
        };
    });
}

export async function addToWatchlist(
    userId: string,
    stock: string
): Promise<WatchlistItem | null> {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    if (!stock) {
        throw new Error("Stock symbol is required.");
    }

    try {
        const res =
            await db`INSERT INTO watchlists (user_id, stock) VALUES (${userId}, ${stock}) RETURNING *`;

        return {
            stock: res[0].stock,
            userId: res[0].user_id,
        };
    } catch (e) {
        if (e instanceof postgres.PostgresError && e.code === "23505") {
            // The user already has this stock in their watchlist
            return null;
        }

        throw e;
    }
}

export async function removeFromWatchlist(
    userId: string,
    stock: string
): Promise<void> {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    if (!stock) {
        throw new Error("Stock symbol is required.");
    }

    await db`DELETE FROM watchlists WHERE user_id = ${userId} AND stock = ${stock}`;
}
