import type { SongDetailed } from "ytmusic-api";

export interface Thumbnail {
	url: string
	width: number
	height: number
}

export type Song = SongDetailed & { url: string };
