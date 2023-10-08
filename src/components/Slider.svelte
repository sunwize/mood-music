<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let value: number;
    export let disabled: boolean;

    $: inputStyle = `--progress: ${value}%`;

    const seek = (event: Event) => dispatch("seek", event);
    const onMouseDown = (event: Event) => dispatch("mousedown", event);
    const onMouseUp = (event: Event) => dispatch("mouseup", event);
</script>

<div
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:touchstart={onMouseDown}
    on:touchend={onMouseUp}
    role="button"
    tabindex="-1"
    class={$$props.class}>
    <input
        bind:value={value}
        type="range"
        min="0"
        max="100"
        step="0.1"
        on:change={seek}
        disabled={disabled}
        style={inputStyle}
    />
</div>

<style>
	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
		width: 100%;
		height: 0.5rem;
	}

	input[type="range"]::-webkit-slider-runnable-track {
		background: rgba(255, 255, 255, 0.2);
		background-image: linear-gradient(white, white);
		background-size: var(--progress) 100%;
		background-repeat: no-repeat;
		border-radius: 5px;
		height: 0.1rem;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		margin-top: -0.3rem;
		background-color: white;
		box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);
		width: 0.75rem;
		height: 0.75rem;
	}
</style>
