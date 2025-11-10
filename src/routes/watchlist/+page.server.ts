import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    // For now, just return empty data
    // Later we'll fetch the user's watchlist items
    return {
        watchlistItems: []
    };
};
