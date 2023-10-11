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
    class={`${$$props.class} input-container`}
>
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

<style lang="scss">
	.input-container {
		input[type="range"] {
			-webkit-appearance: none;
			appearance: none;
			background: transparent;
			cursor: pointer;
			width: 100%;
			height: 10px;

			&::-webkit-slider-runnable-track {
				background: rgba(255, 255, 255, 0.2);
				background-image: linear-gradient(white, white);
				background-size: var(--progress) 100%;
				background-repeat: no-repeat;
				border-radius: 5px;
				height: 4px;

				@media screen and (max-width: 768px) {
					background-image: linear-gradient(to left, theme('colors.primary.500'), theme('colors.primary.500'));
				}
			}

			&::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				margin-top: -4px;
				margin-left: -2px;
				background-color: white;
				box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);
				width: 0.75rem;
				height: 0.75rem;

				@media screen and (min-width: 768px) {
					display: none;
				}
			}
		}

		&:hover {
			input[type="range"] {
				&::-webkit-slider-runnable-track {
					background-image: linear-gradient(to left, theme('colors.primary.500'), theme('colors.primary.500'));
				}

				&::-webkit-slider-thumb {
					display: inherit;
				}
			}
		}
	}
</style>
