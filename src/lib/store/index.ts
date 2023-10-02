import { derived, writable } from "svelte/store";
import type { SongDetailed } from "ytmusic-api";

import { getLargeThumbnail } from "$lib/utils/thumbnails";

export const song = writable<SongDetailed|null>(null);
export const songQueue = writable<SongDetailed[]>([]);
export const songHistory = writable<SongDetailed[]>([]);
export const thumbnail = derived(
    song,
    ($song) => $song?.thumbnails[0]?.url ? getLargeThumbnail($song?.thumbnails[0].url) : "",
);
export const artist = derived(
    song,
    ($song) => $song?.artists.map((artist) => artist.name).join(", "),
);
