<script lang="ts">
    import type { SongDetailed } from "ytmusic-api";
    import { Button, Search, Spinner } from "flowbite-svelte";

    import SearchResultItem from "../components/SearchResultItem.svelte";
    import MusicPlayer from "../components/MusicPlayer.svelte";
    import { api } from "$lib/services/api";

    let query: string = "Lomepal";
    let searching: boolean;
    let results: SongDetailed[] = [];

    const search = async () => {
        if (!query) return;

        try {
            searching = true;
            results = await api.get("/api/search", {
                params: {
                    query,
                },
            }).then((res) => res.data);
        } finally {
            searching = false;
        }
    };

    const onKeyPress = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return;
        return search();
    };
</script>

<section class="dark text-white h-full leading-snug py-6 md:py-12 pb-32">
    <div class="max-w-[600px] mx-auto">
        <div class="w-full mb-6 md:mb-12 px-3">
            <Search
                bind:value={query}
                on:keypress={onKeyPress}>
                <Button on:click={search}>
                    {#if searching}
                        <Spinner
                            class="mr-3"
                            size="4"
                            color="white" />
                    {/if}
                    Search
                </Button>
            </Search>
        </div>
        <div class="grid grid-cols-1">
            {#each results as result}
                <SearchResultItem result={result} />
            {/each}
        </div>
        <MusicPlayer />
    </div>
</section>
