import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { generatePlaylist } from "$lib/playlist-ai";
import { json } from "@sveltejs/kit";
import { youtubeMusic } from "$lib/youtube-music";
import ytdl from "ytdl-core";
import type { Song } from "../../../types/song";

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
    const { prompt } = await request.json();
    const songs: string[] = await generatePlaylist(prompt);

    const playlist: Song[] = [];

    for (const song of songs) {
        const [result] = await youtubeMusic.searchSongs(song);
        const songInfo = await ytdl.getInfo(result.videoId);
        const format = ytdl.chooseFormat(songInfo.formats, { quality: "highestaudio", filter: "audioonly" });

        playlist.push({
            ...result,
            url: format.url,
        });
    }

    return json(playlist);
};