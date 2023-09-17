import { derived, writable } from "svelte/store";
import type { Song } from "../../types/song";

export const song = writable<Song|null>(null);
export const thumbnail = derived(
    song,
    ($song) => $song?.thumbnails[0]?.url.split("=w")[0] + "=w500-h500-l90-rj",
);
export const artist = derived(
    song,
    ($song) => $song?.artists.map((artist: { name: string }) => artist.name).join(" - "),
);