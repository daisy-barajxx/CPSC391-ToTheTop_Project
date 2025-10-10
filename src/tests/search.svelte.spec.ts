import { describe, it, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/svelte";
import { dummyStocks } from "$lib/server/dummyStocks";
import Page from "../routes/+page.svelte";

describe("Stock Search Page", () => {
// test 1:
  it("filters and displays the correct stock resutls when typing", async () => {
    render(Page);
    const input = screen.getByPlaceholderText("Search stocks by name or symbol...");
    // Type into the search box
    await fireEvent.input(input, { target: { value: "AAPL" } });
    // Find Apple in the results
    const appleText = `${dummyStocks[0].name} (${dummyStocks[0].symbol})`;
    // Wait until it appears
    const apple = await screen.findByText(appleText);
    expect(apple).toBeTruthy();
});
// test 2:
    it("shows 'No results found' when search yields no matches", async () => {
        render(Page);
        const input = screen.getByPlaceholderText("Search stocks by name or symbol...");
        await fireEvent.input(input, { target: { value: "XYZ" } });
        expect(await screen.findByText("No results found.")).toBeTruthy();
});
// test 3:
    it("matches results regardless of case", async () => {
        render(Page);
        const input = screen.getByPlaceholderText("Search stocks by name or symbol...");
        await fireEvent.input(input, { target: { value: "micros" } });
        const micro = await screen.findByText("Microsoft Corporation (MSFT)");
        expect(micro).toBeTruthy();
});
});