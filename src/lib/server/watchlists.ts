import type { WatchlistItem } from "$lib";
import db from "./db";

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
    return [
        { id: "1", stock: "AAPL", userId },
        { id: "2", stock: "GOOGL", userId },
        { id: "3", stock: "MSFT", userId },
    ];

    // Will uncomment when all functionality is ready
    // if (!userId) {
    //     throw new Error("User ID is required.");
    // }

    // const res = await db`SELECT * FROM watchlists WHERE user_id = ${userId}`;

    // return res.map((item) => {
    //     return {
    //         id: item.id,
    //         stock: item.stock,
    //         userId: item.user_id,
    //     };
    // });
}

export async function addToWatchlist(
    userId: string,
    stock: string
): Promise<WatchlistItem> {
    return { id: "", stock, userId };
}

export async function removeFromWatchlist(
    userId: string,
    stock: string
): Promise<void> {
    return;
}
