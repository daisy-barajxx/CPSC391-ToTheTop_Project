import type { WatchlistItem } from "$lib";
import postgres from "postgres";
import db from "./db";

/**
 * Retrieve the watchlist for a specific user.
 *
 * @param userId - The unique identifier of the user whose watchlist should be fetched.
 *                 Must be a non-empty string.
 *
 * @returns A Promise that resolves to an array of `WatchlistItem` objects. Each item
 *          contains the stock identifier and the normalized userId property.
 *
 * @throws {Error} If `userId` is empty.
 */
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

/**
 * Checks whether a given stock symbol is present in a user's watchlist.
 *
 * @param userId - The non-empty identifier of the user whose watchlist will be checked.
 * @param stock - The non-empty stock symbol to search for in the watchlist.
 *
 * @returns A promise that resolves to true if exactly one matching entry exists; otherwise false.
 *
 * @throws {Error} If either `userId` or `stock` is empty.
 */
export async function isInWatchlist(
    userId: string,
    stock: string
): Promise<boolean> {
    if (!userId || !stock) {
        throw new Error("User ID and stock symbol are required.");
    }

    const res =
        await db`SELECT COUNT(*) FROM watchlists WHERE user_id = ${userId} AND stock = ${stock}`;

    return res[0].count == 1;
}

/**
 * Adds a stock symbol to a user's watchlist in the database.
 *
 * @param userId - The ID of the user who owns the watchlist. Must be a non-empty string.
 * @param stock - The stock symbol to add to the user's watchlist. Must be a non-empty string.
 *
 * @returns A promise that resolves to the created `WatchlistItem`, or `null`
 * if the item already exists in the user's watchlist.
 *
 * @throws {Error} If `userId` or `stock` is empty.
 */
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

/**
 * Removes a stock symbol from a user's watchlist in the database.
 *
 * @param userId - The ID of the user whose watchlist should be modified. Must be a non-empty string.
 * @param stock - The stock symbol to remove from the watchlist. Must be a non-empty string.
 *
 * @returns A Promise that resolves when the removal operation completes.
 *
 * @throws {Error} If `userId` or `stock` is empty.
 */
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
