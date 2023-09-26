<script lang="ts">
import { Button } from "flowbite-svelte";
import { BackwardStepSolid, ForwardStepSolid, PauseSolid, PlaySolid } from "flowbite-svelte-icons";
import Slider from "./Slider.svelte";
import { formatSongTime } from "$lib/utils/formatTime";
import { onDestroy, onMount } from "svelte";
import { song } from "$lib/store";

let audio: HTMLAudioElement;
let currentTime = 0;
let duration = 0;
let playing = false;
let seeking = false;
let loading = false;

$: progress = currentTime === 0 ? 0 : currentTime * 100 / duration;
$: progressDisplayTime = formatSongTime(currentTime, duration);
$: durationDisplayTime = formatSongTime(duration, duration);

const playOrPause = () => playing ? audio?.pause() : audio?.play();
const seek = () => {
	audio.currentTime = progress * audio.duration / 100;
	currentTime = audio.currentTime;
};
const onMouseDown = () => seeking = true;
const onMouseUp = () => seeking = false;
const loadSongFromUrl = async (videoId: string) => {
	const { url }: { url: string } = await fetch(`/api/song/${videoId}`)
		.then((res) => res.json());
	return loadSong(url);
};
const loadSong = (url: string) => {
	if (!audio) return;
	audio.src = url;
	audio.currentTime = 0;
	playing = false;
	audio.pause();
	audio.load();
};

onMount(() => {
	audio = new Audio();
	audio.volume = 0.1;

	if (!audio.src && $song) {
		loadSongFromUrl($song.videoId);
	}

	audio.addEventListener("play", () => playing = true);
	audio.addEventListener("pause", () => playing = false);
	audio.addEventListener("loadstart", () => loading = true);
	audio.addEventListener("canplay", () => {
		loading = false;
		duration = isNaN(audio.duration) ? 0 : audio.duration;
	});
	audio.addEventListener("timeupdate", () => {
		if (seeking) return;
		currentTime = isNaN(audio.currentTime) ? 0 : audio.currentTime;
		duration = isNaN(audio.duration) ? 0 : audio.duration;
	});
});

const unsubscribe = song.subscribe(async (value) => {
	if (!value || !audio) return;
	await loadSongFromUrl(value.videoId);
});

onDestroy(unsubscribe);
</script>

<aside class="fixed bottom-0 left-0 w-full bg-black flex justify-center items-center p-3">
	<div class="flex-1 max-w-3xl">
		<div class="flex justify-center items-center gap-3 mb-1">
			<Button pill outline class="!p-2">
				<BackwardStepSolid class="pointer-events-none" size="sm" tabindex="-1" />
			</Button>
			<Button on:click={playOrPause} pill outline class="!p-3">
				{#if playing}
					<PauseSolid class="pointer-events-none" size="md" tabindex="-1" />
				{:else}
					<PlaySolid class="pointer-events-none" size="md" tabindex="-1" />
				{/if}
			</Button>
			<Button pill outline class="!p-2">
				<ForwardStepSolid class="pointer-events-none" size="sm" tabindex="-1" />
			</Button>
		</div>
		<div class="flex items-center gap-2">
			<div class="text-xs opacity-50">{progressDisplayTime}</div>
			<Slider bind:value={progress} on:seek={seek} disabled={loading} on:mousedown={onMouseDown} on:mouseup={onMouseUp} class="flex-1" />
			<div class="text-xs opacity-50">{durationDisplayTime}</div>
		</div>
	</div>
</aside>
