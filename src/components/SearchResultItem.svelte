<script lang="ts">
	import type { SongDetailed } from "ytmusic-api";
	import { getSmallThumbnail } from "$lib/utils/thumbnails";
	import { song } from "$lib/store";

	export let result: SongDetailed;

	const getResultTypeLabel = (type: string) => type.toLowerCase().charAt(0).toUpperCase() + type.toLowerCase().slice(1);
	const loadSong = () => {
		if (result) {
			song.set(result);
		}
	};
</script>

<article on:click={loadSong} role="presentation" class="flex items-center hover:bg-white/10 active:bg-white/20 cursor-pointer select-none">
	<img src={getSmallThumbnail(result.thumbnails[0].url)} alt={result.name} class="w-16 aspect-square object-cover">
	<div class="px-3">
		<p class="font-medium text-xl">{result.name}</p>
		<p class="opacity-70">{getResultTypeLabel(result.type)}</p>
	</div>
</article>
