<script lang="ts">
    import { song } from "$lib/store";
    import { onDestroy, onMount } from "svelte";
    import { BackwardStepSolid, ForwardStepSolid, PauseSolid, PlaySolid } from "flowbite-svelte-icons";
    import { Button } from "flowbite-svelte";

    let audio: HTMLAudioElement;
    let progress = 0;
    let playing = false;
    let seeking = false;
    let loading = false;

    $: inputStyle = `--progress: ${progress}%`;

    const playOrPause = () => playing ? audio?.pause() : audio?.play();
    const seek = () => audio.currentTime = progress * audio.duration / 100;
    const onMouseDown = () => seeking = true;
    const onMouseUp = () => seeking = false;
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
        audio.src = $song?.url || "";

        audio.addEventListener("play", () => playing = true);
        audio.addEventListener("pause", () => playing = false);
        audio.addEventListener("loadstart", () => loading = true);
        audio.addEventListener("canplay", () => loading = false);
        audio.addEventListener("timeupdate", () => {
            if (seeking) return;
            progress = audio.currentTime === 0 ? 0 : audio.currentTime * 100 / audio.duration;
        });
    });

    const unsubscribe = song.subscribe((value) => {
        if (!value || !audio) return;
        loadSong(value.url);
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