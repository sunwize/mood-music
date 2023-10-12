<script lang="ts">
    import type { SongDetailed } from "ytmusic-api";
    import { Button, Listgroup, ListgroupItem, Search, Spinner } from "flowbite-svelte";

    import SearchResultItem from "../components/SearchResultItem.svelte";
    import MusicPlayer from "../components/MusicPlayer.svelte";
    import { api } from "$lib/services/api";

    let query = "Lomepal";
    let searching = false;
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

<section class="dark text-white h-full leading-snug">
    <div class="w-full max-w-[600px] mx-auto flex flex-col h-full min-h-full overflow-hidden pt-3">
        <div class="mb-3">
            <div class="relative mx-3">
                <Search
                    bind:value={query}
                    on:keypress={onKeyPress}
                >
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
                {#if false}
                    <Listgroup
                        active
                        class="absolute w-full left-0"
                    >
                        <ListgroupItem>Lomepal</ListgroupItem>
                        <ListgroupItem>Remeo Elvis</ListgroupItem>
                    </Listgroup>
                {/if}
            </div>
        </div>
        <div class="grid grid-cols-1 h-full overflow-auto">
            {#each results as result}
                <SearchResultItem result={result} />
            {/each}
        </div>
    </div>
    <MusicPlayer />
</section>

<style lang="scss">
	section {
		position: relative;
		height: 100%;
		min-height: 100%;
		display: grid;
		grid-auto-columns: auto 1fr;
		grid-template-rows: 1fr auto;
	}
</style>
