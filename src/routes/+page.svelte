<script lang="ts">
    async function search(term: string) {
        const response = await fetch(`/stocks/search/?term=${term}`);

        console.log(await response.json());
    }

    $effect(() => {
        search("something");
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
    documentation
</p>

<a href="stocks/msft">This is a link to a stock.</a>
