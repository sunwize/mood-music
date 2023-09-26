<script lang="ts">
    import { song } from "$lib/store";
    import { onDestroy, onMount } from "svelte";
    import { BackwardStepSolid, ForwardStepSolid, PauseSolid, PlaySolid } from "flowbite-svelte-icons";
    import { Button } from "flowbite-svelte";
    import { formatSongTime } from "$lib/utils/formatTime";

    let audio: HTMLAudioElement;
    let currentTime = 0;
    let duration = 0;
    let playing = false;
    let seeking = false;
    let loading = false;

    $: progress = currentTime === 0 ? 0 : currentTime * 100 / duration;
    $: progressDisplayTime = formatSongTime(currentTime, duration);
    $: durationDisplayTime = formatSongTime(duration, duration);
    $: inputStyle = `--progress: ${progress}%`;

    const playOrPause = () => playing ? audio?.pause() : audio?.play();
    const seek = () => {
        audio.currentTime = progress * audio.duration / 100;
        currentTime = audio.currentTime;
    };
    const onMouseDown = () => seeking = true;
    const onMouseUp = () => seeking = false;
    // const loadSong = (url: string) => {
    //     if (!audio) return;
    //     audio.src = url;
    //     audio.currentTime = 0;
    //     playing = false;
    //     audio.pause();
    //     audio.load();
    // };

    onMount(() => {
        audio = new Audio();
		audio.volume = 0.1;
		// TODO: Load the song

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

    const unsubscribe = song.subscribe((value) => {
        if (!value || !audio) return;
		// TODO: Load the song
    });

    onDestroy(unsubscribe);
</script>

<div>
    <div class="flex items-center justify-center gap-3 mb-2">
        <Button pill outline class="!p-3">
            <BackwardStepSolid class="pointer-events-none select-none" size="sm" tabindex="-1" />
        </Button>
        <Button on:click={playOrPause} pill outline class="!p-4">
            {#if playing}
                <PauseSolid class="pointer-events-none" tabindex="-1" />
            {:else}
                <PlaySolid class="pointer-events-none" tabindex="-1" />
            {/if}
        </Button>
        <Button pill outline class="!p-3">
            <ForwardStepSolid class="pointer-events-none" size="sm" tabindex="-1" />
        </Button>
    </div>
    <div on:mousedown={onMouseDown} on:mouseup={onMouseUp} role="button" tabindex="-1">
        <input bind:value={progress} on:change={seek} disabled={loading} style={inputStyle} type="range" min="0" max="100">
    </div>
    <div class="flex justify-between opacity-70 text-sm">
        <div>{progressDisplayTime}</div>
        <div>{durationDisplayTime}</div>
    </div>
</div>

<style>
    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
        height: 1rem;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        background: rgba(255, 255, 255, 0.2);
        background-image: linear-gradient(white, white);
        background-size: var(--progress) 100%;
        background-repeat: no-repeat;
        border-radius: 5px;
        height: 0.2rem;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        margin-top: -0.4rem;
        background-color: white;
        box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);
        width: 1rem;
        height: 1rem;
    }
</style>
