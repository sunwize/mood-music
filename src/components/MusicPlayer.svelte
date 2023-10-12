<script lang="ts">
    import type { SongDetailed } from "ytmusic-api";
    import { Button } from "flowbite-svelte";
    import { BackwardStepSolid, ForwardStepSolid, PauseSolid, PlaySolid } from "flowbite-svelte-icons";

    import { artist, song, songHistory, songQueue, thumbnail } from "$lib/store";
    import Slider from "./Slider.svelte";
    import { formatSongTime } from "$lib/utils/formatTime";
    import { onDestroy, onMount } from "svelte";
    import { api } from "$lib/services/api";
    import { browser } from "$app/environment";

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
        loadNextSong(videoId);
        loadSongUrl(videoId);
    };
    const loadSongUrl = (videoId: string) => {
        if (!audio) return;
        audio.src = `${window.origin}/api/song/listen/${videoId}`;
        audio.currentTime = 0;
        playing = false;
        audio.pause();
        audio.load();
        audio.currentTime = currentTime;
    };
    const loadNextSong = async (videoId: string) => {
        const { song }: { song: SongDetailed } = await api.post(`/api/song/similar/${videoId}`, {
            songHistory: $songHistory,
        }).then((res) => res.data);

        if (song) {
            songQueue.set([
                ...$songQueue,
                song,
            ]);
        }
    };
    const playNextSong = () => {
        const nextSong = $songQueue[0];

        if (nextSong) {
            audio.pause();
            audio.currentTime = 0;

            songQueue.set($songQueue.slice(1, $songQueue.length));
            if ($song) {
                songHistory.set([
                    $song,
                    ...$songHistory,
                ]);
            }

            song.set(nextSong);
        }
    };
    const playPreviousSong = () => {
        const previousSong = $songHistory[0];

        if (previousSong) {
            audio.pause();
            audio.currentTime = 0;

            songHistory.set($songHistory.slice(1, $songHistory.length));
            if ($song) {
                songQueue.set([
                    $song,
                    ...$songQueue,
                ]);
            }

            song.set(previousSong);
        }
    };
    const restoreAudioState = () => {
        let localStorageEntry = localStorage.getItem("song");
        if (localStorageEntry) {
            try {
                song.set(JSON.parse(localStorageEntry));
            } catch (err) {
                console.error("Song could not be restored from local storage", err);
            }
        }

        localStorageEntry = localStorage.getItem("currentTime");
        if (localStorageEntry) {
            try {
                const { currentTime: time }: { currentTime: number } = JSON.parse(localStorageEntry);
                currentTime = time;
                audio.currentTime = time;
            } catch (err) {
                console.error("Could not retrieve current time from local storage", err);
            }
        }

        localStorageEntry = localStorage.getItem("duration");
        if (localStorageEntry) {
            try {
                const { duration: time }: { duration: number } = JSON.parse(localStorageEntry);
                duration = time;
            } catch (err) {
                console.error("Could not retrieve duration from local storage", err);
            }
        }
    };

    onMount(() => {
        audio = new Audio();
        audio.volume = 0.1;

        restoreAudioState();

        if (!audio.src && $song) {
            loadSongFromVideoId($song.videoId);
        }

        audio.addEventListener("play", () => playing = true);
        audio.addEventListener("pause", () => playing = false);
        audio.addEventListener("loadstart", () => loading = true);
        audio.addEventListener("canplay", () => {
            loading = false;
            duration = isNaN(audio.duration) ? 0 : audio.duration;
            localStorage.setItem("duration", JSON.stringify({ duration }));
        });
        audio.addEventListener("timeupdate", () => {
            if (seeking) return;
            currentTime = isNaN(audio.currentTime) ? 0 : audio.currentTime;
            duration = isNaN(audio.duration) ? duration ?? 0 : audio.duration;
            localStorage.setItem("currentTime", JSON.stringify({ currentTime }));
        });
        audio.addEventListener("ended", () => playNextSong());
        audio.addEventListener("error", () => playNextSong());
    });

    const unsubscribe = song.subscribe(async (value) => {
        if (!value || !audio) return;
        if (browser) {
            const localStorageEntry = localStorage.getItem("song");
            if (localStorageEntry) {
                const song = JSON.parse(localStorageEntry) as SongDetailed;

                if (song.videoId !== value.videoId) {
                    currentTime = 0;
                    audio.currentTime = 0;
                }
            }
            localStorage.setItem("song", JSON.stringify(value));
        }
        audio.pause();
        await loadSongFromVideoId(value.videoId);
        await audio.play();
    });

    onDestroy(unsubscribe);
</script>

{#if $song}
    <aside class="hidden md:grid w-full bg-black grid-cols-12 gap-3 border-t border-white/30 p-3">
        <div class="col-span-3 flex items-center gap-5">
            <img
                src={$thumbnail}
                alt={$song.name}
                class="w-16 aspect-square rounded"
            />
            <div class="truncate">
                <p class="text-lg font-medium truncate">{$song.name}</p>
                <p class="opacity-80 truncate">{$artist}</p>
            </div>
        </div>
        <div class="col-span-6 max-w-3xl">
            <div class="flex justify-center items-center gap-3 mb-1">
                <Button
                    on:click={playPreviousSong}
                    pill
                    outline
                    disabled={loading}
                    class="!p-2"
                >
                    <BackwardStepSolid
                        class="pointer-events-none"
                        size="sm"
                        tabindex="-1"
                    />
                </Button>
                <Button
                    on:click={playOrPause}
                    pill
                    outline
                    disabled={loading}
                    class="!p-3"
                >
                    {#if playing}
                        <PauseSolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1"
                        />
                    {:else}
                        <PlaySolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1"
                        />
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
                        tabindex="-1"
                    />
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
                    class="flex-1"
                />
                <div class="text-xs opacity-50">{durationDisplayTime}</div>
            </div>
        </div>
        <div class="col-span-3" />
    </aside>
    <aside class="block md:hidden w-full bg-black border-t border-white/30 p-3">
        <div class="grid grid-cols-12 gap-3">
            <div class="col-span-2 flex items-center justify-center">
                <img
                    src={$thumbnail}
                    alt={$song.name}
                    class="w-12 aspect-square rounded"
                />
            </div>
            <div class="col-span-8 truncate flex flex-col justify-center">
                <h2 class="font-medium truncate">{$song.name}</h2>
                <p class="text-sm">{$artist}</p>
            </div>
            <div class="col-span-2 flex items-center justify-center">
                <Button
                    on:click={playOrPause}
                    color="none"
                    pill
                    outline
                    disabled={loading}
                    class="!p-3"
                >
                    {#if playing}
                        <PauseSolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1"
                        />
                    {:else}
                        <PlaySolid
                            class="pointer-events-none"
                            size="md"
                            tabindex="-1"
                        />
                    {/if}
                </Button>
            </div>
        </div>
        <div class="flex items-center gap-2 mt-3">
            <div class="text-xs opacity-50">{progressDisplayTime}</div>
            <Slider
                bind:value={progress}
                on:seek={seek}
                disabled={loading}
                on:mousedown={onMouseDown}
                on:mouseup={onMouseUp}
                class="flex-1"
            />
            <div class="text-xs opacity-50">{durationDisplayTime}</div>
        </div>
    </aside>
{/if}
