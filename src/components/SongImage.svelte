<script lang="ts">
    import vinyle from "$lib/images/vinyle.png";

    export let image: string;
    export let songName: string;
</script>

<div class={`relative pointer-events-none select-none flex justify-center ${$$props.class}`}>
    <img src={vinyle} alt="vinyle" class="spin w-full drop-shadow block mx-auto">
    <img src={image} alt={songName} class="spin-center object-cover rounded-full w-[32%] absolute top-1/2 left-1/2">
    <div class="spin-center h-4 w-4 shadow-inner bg-gray-200 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
</div>

<style>
    @keyframes spin {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes spin-center {
        from {
            transform: rotate(0) translate(-50%, -50%);
        }
        to {
            transform: rotate(360deg) translate(-50%, -50%);
        }
    }

    .spin {
        animation: spin infinite linear 5s;
    }

    .spin-center {
        animation: spin-center infinite linear 5s;
        transform-origin: 0 0;
    }
</style>
