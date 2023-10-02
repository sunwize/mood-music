<script lang="ts">
    import type { SongDetailed } from "ytmusic-api";
    import { Button } from "flowbite-svelte";
    import { BackwardStepSolid, ForwardStepSolid, PauseSolid, PlaySolid } from "flowbite-svelte-icons";

    import { song, thumbnail, artist, songQueue, songHistory } from "$lib/store";
    import Slider from "./Slider.svelte";
    import { formatSongTime } from "$lib/utils/formatTime";
    import { onDestroy, onMount } from "svelte";
    import type { Song } from "../types/song";
    import { api } from "$lib/services/api";

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
    const loadSongFromVideoId = async (videoId: string) => {
        const { song: { url } }: { song: Song } = await api.get(`/api/song/${videoId}`)
            .then((res) => res.data);
        loadNextSong(videoId);
        return loadSongUrl(url);
    };
    const loadSongUrl = (url: string) => {
        if (!audio) return;
        audio.src = url;
        audio.currentTime = 0;
        playing = false;
        audio.pause();
        audio.load();
    };
    const loadNextSong = async (videoId: string) => {
        const { song }: { song: SongDetailed } = await api.post(`/api/song/similar/${videoId}`, {
            songHistory: $songHistory,
        })
            .then((res) => res.data);
        songQueue.set([
            ...$songQueue,
            song,
        ]);
    };
    const playNextSong = () => {
        if ($song) {
            songHistory.set([
                ...$songHistory,
                $song,
            ]);
        }

        const nextSong = $songQueue.shift();

        if (nextSong) {
            song.set(nextSong);
        }
    };

    onMount(() => {
        audio = new Audio();
        audio.volume = 0.1;

        if (!audio.src && $song) {
            loadSongFromVideoId($song.videoId);
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
        audio.addEventListener("ended", () => playNextSong());
    });

    const unsubscribe = song.subscribe(async (value) => {
        if (!value || !audio) return;
        await loadSongFromVideoId(value.videoId);
        await audio.play();
    });

    onDestroy(unsubscribe);
</script>

{#if $song}
    <aside class="fixed bottom-0 left-0 w-full bg-black grid grid-cols-12 gap-3 p-3">
        <div class="col-span-3 flex items-center gap-5">
            {#if $song}
                <img
                    src={$thumbnail}
                    alt={$song.name}
                    class="w-16 aspect-square rounded" />
                <div class="truncate">
                    <p class="text-lg font-medium truncate">{$song.name}</p>
                    <p class="opacity-80 truncate">{$artist}</p>
                </div>
            {/if}
        </div>
        <div class="col-span-6 max-w-3xl">
            <div class="flex justify-center items-center gap-3 mb-1">
                <Button
                    pill
                    outline
                    disabled={loading}
                    class="!p-2">
                    <BackwardStepSolid
                        class="pointer-events-none"
                        size="sm"
                        tabindex="-1" />
                </Button>
                <Button
                    on:click={playOrPause}
                    pill
                    outline
                    disabled={loading}
                    class="!p-3">
                    {#if playing}
                        <PauseSolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1" />
                    {:else}
                        <PlaySolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1" />
                    {/if}
                </Button>
                <Button
                    on:click={playNextSong}
                    pill
                    outline
                    disabled={loading}
                    class="!p-2">
                    <ForwardStepSolid
                        class="pointer-events-none"
                        size="sm"
                        tabindex="-1" />
                </Button>
            </div>
            <div class="flex items-center gap-2">
                <div class="text-xs opacity-50">{progressDisplayTime}</div>
                <Slider
                    bind:value={progress}
                    on:seek={seek}
                    disabled={loading}
                    on:mousedown={onMouseDown}
                    on:mouseup={onMouseUp}
                    class="flex-1" />
                <div class="text-xs opacity-50">{durationDisplayTime}</div>
            </div>
        </div>
        <div class="col-span-3" />
    </aside>
{/if}
