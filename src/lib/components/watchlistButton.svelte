<script lang="ts">
    import { userState } from "$lib/user.svelte";

    interface Props {
        symbol: string;
    }

    let { symbol }: Props = $props();

    let isInWatchlist = $state(false);
    let isLoading = $state(false);
    let errorMessage = $state("");

    async function checkWatchlistStatus() {
        // Only check if user is authenticated
        if (!userState.user) {
            return;
        }

        try {
            const response = await fetch(`/api/watchlists/${symbol}`);
            
            if (response.ok) {
                isInWatchlist = await response.json();
            }
        } catch (error) {
            console.error('Error checking watchlist:', error);
        }
    }

    async function toggleWatchlist() {
        isLoading = true;
        errorMessage = "";

        try {
            if (isInWatchlist) {
                const response = await fetch(`/api/watchlists/${symbol}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    isInWatchlist = false;
                } else {
                    const data = await response.json();
                    errorMessage = data.error || "Failed to remove from watchlist";
                }
            } else {
                const response = await fetch(`/api/watchlists/${symbol}`, {
                    method: 'POST',
                });
                
                if (response.ok) {
                    isInWatchlist = true;
                } else if (response.status === 400) {
                    isInWatchlist = true;
                } else {
                    const data = await response.json();
                    errorMessage = data.error || "Failed to add to watchlist";
                }
            }
        } catch (error) {
            console.error("Error toggling watchlist:", error);
            errorMessage = "An error occured. Please try again later.";
        } finally {
            isLoading = false;
            
            // Clear error message after 3 seconds
            if (errorMessage) {
                setTimeout(() => {
                    errorMessage = "";
                }, 3000);
            }
        }
    }

    $effect(() => {
        checkWatchlistStatus();
    });
</script>

{#if userState.user}
    <div class="watchlist-button-container">
        <button
            class="watchlist-button"
            class:in-watchlist={isInWatchlist}
            onclick={toggleWatchlist}
            disabled={isLoading}
        >
            {#if isLoading}
                <span class="spinner"></span>
                Loading...
            {:else if isInWatchlist}
                <span class="icon">★</span>
                Remove from Watchlist
            {:else}
                <span class="icon">☆</span>
                Add to Watchlist
            {/if}
        </button>

        {#if errorMessage}
            <div class="error-toast">
                {errorMessage}
            </div>
        {/if}
    </div>
{/if}

<style>
    .watchlist-button-container {
        position: relative;
    }

    .watchlist-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        border: 2px solid var(--primary-dark);
        border-radius: 0.5em;
        background-color: white;
        color: var(--primary-dark);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .watchlist-button:hover:not(:disabled) {
        background-color: var(--primary-dark);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .watchlist-button:active:not(:disabled) {
        transform: translateY(0);
    }

    .watchlist-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .watchlist-button.in-watchlist {
        background-color: var(--accent-primary);
        border-color: var(--accent-primary);
        color: white;
    }

    .watchlist-button.in-watchlist:hover:not(:disabled) {
        background-color: var(--money-negative);
        border-color: var(--money-negative);
    }
    
    .icon {
        font-size: 1.2rem;
        line-height: 1;
    }

    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    .error-toast {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 0.5rem;
        padding: 0.75rem 1rem;
        background-color: var(--money-negative);
        color: white;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.2s ease;
        z-index: 10;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
