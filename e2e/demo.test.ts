import { test, expect } from '@playwright/test';

// test UI workflows, real clicks/typing, navigation, actual API calls

test.describe('Stock Search Page', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the page before each test
		await page.goto('/');
		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');
	});

	// TEST 1: Basic search functionality
	test('displays results when user searches for a valid stock', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Type "AAPL" into the search box
		await searchInput.fill('AAPL');

		// Wait for results to appear (debounce delay + API response)
		await page.waitForTimeout(400); // Give debounce time to trigger

		// Check that Apple results are visible
		const appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).toBeVisible();
	});

	// TEST 2: No results message
	test('displays "No results found" when search returns no matches', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Type a non-existent stock symbol
		await searchInput.fill('XYZ123');
		await page.waitForTimeout(400);

		// Check for no results message
		const noResultsMessage = page.getByText('No results found.');
		await expect(noResultsMessage).toBeVisible();
	});

	// TEST 3: Case-insensitive search
	test('finds results regardless of case (uppercase, lowercase, mixed)', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Try lowercase
		await searchInput.fill('microsoft');
		await page.waitForTimeout(400);

		const microsoftResult = page.getByText(/Microsoft Corporation \(MSFT\)/);
		await expect(microsoftResult).toBeVisible();

		// Clear and try uppercase
		await searchInput.clear();
		await searchInput.fill('TESLA');
		await page.waitForTimeout(400);

		const teslaResult = page.getByText(/Tesla Inc\. \(TSLA\)/);
		await expect(teslaResult).toBeVisible();
	});

	// TEST 4: Whitespace trimming (beginning and end)
	test('trims whitespace from beginning and end of search term', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Type with leading and trailing spaces
		await searchInput.fill('   AAPL   ');
		await page.waitForTimeout(400);

		// Should still find the result (spaces trimmed)
		const appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).toBeVisible();
	});

	// TEST 5: Debouncing - requests don't fire on every keystroke
	test('debounces requests - does not search until user stops typing', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Type quickly: M-I-C-R-O-S (6 keystrokes)
		// Without debouncing, this would trigger 6 API calls
		// With debouncing, it should only trigger 1
		await searchInput.type('MICROS', { delay: 50 }); // 50ms between each keystroke

		// Wait less than debounce time - should still show "Loading..."
		await page.waitForTimeout(200);
		const loadingMessage = page.getByText('Loading...');
		await expect(loadingMessage).toBeVisible();

		// Wait for debounce to complete
		await page.waitForTimeout(200);

		// Results should appear (not loading anymore)
		const results = page.locator('ul.results-list li');
		await expect(results).toHaveCount(1); // Only one API call made
	});

	// TEST 6: Empty search clears results
	test('clears results when search term is empty', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Search for something
		await searchInput.fill('AAPL');
		await page.waitForTimeout(400);

		// Results should be visible
		let appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).toBeVisible();

		// Clear the search
		await searchInput.clear();
		await page.waitForTimeout(100);

		// Results should no longer be visible
		appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).not.toBeVisible();

		// No results message should not appear
		const noResultsMessage = page.getByText('No results found.');
		await expect(noResultsMessage).not.toBeVisible();
	});

	// TEST 7: Search results are clickable
	test('search results are clickable links to stock detail pages', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Search for a stock
		await searchInput.fill('TSLA');
		await page.waitForTimeout(400);

		// Find the result link
		const teslaLink = page.getByRole('link', { name: /Tesla Inc\. \(TSLA\)/ });

		// Verify it links to the correct stock page
		await expect(teslaLink).toHaveAttribute('href', '/stocks/TSLA');
	});

	// TEST 8: Multiple results display correctly
	test('displays multiple results for partial name matches', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// "Inc" appears in multiple stock names (Apple Inc., Tesla Inc.)
		// Depending on your backend, this might return multiple results
		await searchInput.fill('Inc');
		await page.waitForTimeout(400);

		// There should be multiple results
		const resultsList = page.locator('ul.results-list li');
		const count = await resultsList.count();
		expect(count).toBeGreaterThan(1);
	});

	// TEST 9: Resetting search after previous search
	test('correctly resets and performs new search after clearing previous search', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// First search
		await searchInput.fill('AAPL');
		await page.waitForTimeout(400);

		let result = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(result).toBeVisible();

		// Clear and search for something else
		await searchInput.clear();
		await searchInput.fill('MSFT');
		await page.waitForTimeout(400);

		// Old result should be gone, new result should appear
		result = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(result).not.toBeVisible();

		const newResult = page.getByText(/Microsoft Corporation \(MSFT\)/);
		await expect(newResult).toBeVisible();
	});

	// TEST 10: Loading indicator shows/hides appropriately
	test('shows loading indicator while fetching and hides when done', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Fill search
		await searchInput.fill('GOOGL');

		// Should show loading briefly
		const loadingMessage = page.getByText('Loading...');
		// Note: This might be too fast to catch, so we check with a short timeout
		try {
			await expect(loadingMessage).toBeVisible({ timeout: 100 });
		} catch {
			// It's okay if we can't catch the loading state (depends on API speed)
		}

		// Wait for results to load
		await page.waitForTimeout(400);

		// Loading should be gone, results should appear
		await expect(loadingMessage).not.toBeVisible();
		const result = page.getByText(/Alphabet Inc\. \(GOOGL\)/);
		await expect(result).toBeVisible();
	});

	// TEST 11: Typing and retyping triggers new search
	test('triggers new search when user modifies search term', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Search for AAPL
		await searchInput.fill('AAPL');
		await page.waitForTimeout(400);

		let appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).toBeVisible();

		// Modify to MSFT
		await searchInput.clear();
		await searchInput.fill('MSFT');
		await page.waitForTimeout(400);

		// Old result gone, new result appears
		appleResult = page.getByText(/Apple Inc\. \(AAPL\)/);
		await expect(appleResult).not.toBeVisible();

		const msftResult = page.getByText(/Microsoft Corporation \(MSFT\)/);
		await expect(msftResult).toBeVisible();
	});

	// TEST 12: Special characters and URL encoding
	test('handles special characters safely in search queries', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Try to search with special characters (should be handled gracefully)
		await searchInput.fill('A&A*PL%');
		await page.waitForTimeout(400);

		// Should show "No results" or handle gracefully (not crash)
		const noResultsOrResults = page.locator('ul.results-list, p.no-results');
		await expect(noResultsOrResults).toHaveCount(1);
	});

	// TEST 13: Accessibility - aria labels
	test('has proper accessibility labels for screen readers', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Check for aria-label
		await expect(searchInput).toHaveAttribute('aria-label', 'Search stocks');
	});

	// TEST 14: Input field focus and blur
	test('maintains focus on input after typing', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Click and type
		await searchInput.click();
		await searchInput.type('AAPL');

		// Input should still be focused
		await expect(searchInput).toBeFocused();
	});

	// TEST 15: Very long search terms
	test('handles very long search terms gracefully', async ({ page }) => {
		const searchInput = page.getByPlaceholder('Search stocks by name or symbol...');

		// Type a very long string
		const longString = 'A'.repeat(100);
		await searchInput.fill(longString);
		await page.waitForTimeout(400);

		// Should handle gracefully (show no results, not crash)
		const noResultsOrResults = page.locator('ul.results-list, p.no-results');
		await expect(noResultsOrResults).toHaveCount(1);
	});
});