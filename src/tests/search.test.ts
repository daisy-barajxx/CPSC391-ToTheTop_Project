import { search } from "$lib/server/search";
import { describe, expect, it } from "vitest";

describe("search backend", () => {
    it("no search term causes error", async () => {
        await expect(search("")).rejects.toThrow("Search term is required");
    });

    it("returns nothing if no matches", async () => {
        const results = await search("zzzzzzzzzzzzzz");
        expect(results.length).toBe(0);
    });

    it("searches by name", async () => {
        const results = await search("apple");

        expect(results.length).toBe(1);
        expect(results[0]).toEqual({
            name: "Apple Inc.",
            symbol: "AAPL",
        });
    });

    it("searches by mixed-case name", async () => {
        const results = await search("MiCROsofT");
        expect(results.length).toBe(1);
        expect(results[0]).toEqual({
            name: "Microsoft Corporation",
            symbol: "MSFT",
        });
    });

    it("searches by partial name", async () => {
        const results = await search("soft");
        expect(results.length).toBe(1);
        expect(results[0]).toEqual({
            name: "Microsoft Corporation",
            symbol: "MSFT",
        });
    });

    it("searches by symbol", async () => {
        const results = await search("aapl");

        expect(results.length).toBe(1);
        expect(results.some((stock) => stock.name === "Apple Inc.")).toBe(true);
        expect(results.some((stock) => stock.symbol === "AAPL")).toBe(true);
    });

    it("searches by mixed-case symbol", async () => {
        const results = await search("MsFt");
        expect(results.length).toBe(1);
        expect(
            results.some((stock) => stock.name === "Microsoft Corporation")
        ).toBe(true);
        expect(results.some((stock) => stock.symbol === "MSFT")).toBe(true);
    });

    it("searches by partial symbol", async () => {
        const results = await search("apl");
        expect(results.length).toBe(1);
        expect(results.some((stock) => stock.name === "Apple Inc.")).toBe(true);
        expect(results.some((stock) => stock.symbol === "AAPL")).toBe(true);
    });

    it("limits results to 5", async () => {
        const results = await search(" ");
        expect(results.length).lessThanOrEqual(5);
    });
});
