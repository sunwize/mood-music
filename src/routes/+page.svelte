<script lang="ts">
	import type { SongDetailed } from "ytmusic-api";
	import { Button, Search, Spinner } from "flowbite-svelte";

	import SearchResultItem from "../components/SearchResultItem.svelte";
	import MusicPlayer from "../components/MusicPlayer.svelte";
	import { song } from "$lib/store";

	let query: string = "Happy";
	let searching: boolean;
	let results: SongDetailed[] = [];

	const search = async () => {
		if (!query) return;

		try {
			searching = true;
			results = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
				method: "GET",
			}).then((res) => res.json());
		} finally {
			searching = false;
		}
	};

	const onKeyPress = (event: KeyboardEvent) => {
		if (event.key !== "Enter") return;
		return search();
	};
</script>

<section class="dark text-white h-full leading-snug py-12">
	<div class="max-w-[600px] mx-auto">
		<div class="w-full mb-12">
			<Search bind:value={query} on:keypress={onKeyPress}>
				<Button on:click={search}>
					{#if searching}
						<Spinner class="mr-3" size="4" color="white"/>
					{/if}
					Search
				</Button>
			</Search>
		</div>
		<div class="grid grid-cols-1 gap-3">
			{#each results as result}
				<SearchResultItem result={result} />
			{/each}
		</div>
		{#if $song}
			<MusicPlayer />
		{/if}
	</div>
</section>
