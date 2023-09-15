<script lang="ts">
	import type { PageData } from "./$types";
	import SongImage from "../components/SongImage.svelte";
	import { onMount } from "svelte";
	import { Button, Search, Spinner } from "flowbite-svelte";
	import { goto } from "$app/navigation";
	import { song } from "$lib/store";

	export let data: PageData;

	let audio: HTMLAudioElement;
	let search: string;
	let searching: boolean;

	song.set(data.song);

	$: thumbnail = $song?.thumbnails[0]?.url.split("=w")[0] + "=w500-h500-l90-rj";
	$: artist = $song?.artists.map((artist: { name: string }) => artist.name).join(" - ");

	const searchSong = async () => {
		if (!search) return;
		searching = true;
		await goto(`/?q=${search}`);
		searching = false;
		await audio.play();
	};

	onMount(() => {
		audio.volume = 0.2;
	});
</script>

<section class="dark bg-blue-950 text-white h-full py-16">
	<div class="max-w-[600px] mx-auto flex flex-col items-center h-full">
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
			<SongImage image={thumbnail} songName={$song.name} class="mb-5"/>
			<h1 class="text-4xl font-bold text-center mb-3">{$song.name}</h1>
			<p class="text-2xl opacity-70 text-center mb-12">{artist}</p>
			<audio bind:this={audio} src={$song.url} controls></audio>
		{/if}
	</div>
</section>
