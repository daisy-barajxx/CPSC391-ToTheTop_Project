export interface SearchResult {
    symbol: string;
    name: string;
}

export async function search(term: string): Promise<SearchResult[]> {
    return [{ symbol: "FOO", name: "Foo Corp" }];
}
