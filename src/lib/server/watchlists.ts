import type { WatchlistItem } from "$lib";
import db from "./db";

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    const res = await db`SELECT * FROM watchlists WHERE user_id = ${userId}`;

    return res.map((item) => {
        return {
            id: item.id,
            stock: item.stock,
            userId: item.user_id,
        };
    });
}

export async function addToWatchlist(
    userId: string,
    stock: string
): Promise<WatchlistItem> {}

export async function removeFromWatchlist(
    userId: string,
    stock: string
): Promise<void> {}
