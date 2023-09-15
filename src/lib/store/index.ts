import { writable } from "svelte/store";
import type { Song } from "../../types/song";

export const song = writable<Song|null>(null);
