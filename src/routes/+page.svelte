<script lang="ts">
	import type { PageData } from "./$types";
	import SongImage from "../components/SongImage.svelte";
	import { Button, Search, Spinner } from "flowbite-svelte";
	import { goto } from "$app/navigation";
	import { song, thumbnail, artist } from "$lib/store";
	import MusicPlayer from "../components/MusicPlayer.svelte";

	export let data: PageData;

	let search: string;
	let searching: boolean;

	const searchSong = async () => {
		if (!search) return;
		searching = true;
		await goto(`/?q=${search}`);
		searching = false;
	};

	$: {
		song.set(data.song);
	}
</script>

<section class="dark text-white h-full py-12">
	<div class="max-w-[600px] mx-auto">
		<div class="w-full mb-12">
			<Search bind:value={search}>
				<Button on:click={searchSong}>
					{#if searching}
						<Spinner class="mr-3" size="4" color="white"/>
					{/if}
					Search
				</Button>
			</Search>
		</div>
		{#if $song}
			<SongImage image={$thumbnail} songName={$song.name} class="w-[40vh] mx-auto mb-5"/>
			<h1 class="text-4xl font-bold text-center mb-3">{$song.name}</h1>
			<p class="text-2xl opacity-70 text-center mb-5">{$artist}</p>
			<MusicPlayer />
		{/if}
	</div>
</section>
