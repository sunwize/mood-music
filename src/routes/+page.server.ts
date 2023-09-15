import {youtubeMusic} from "$lib/youtube-music";
import ytdl from "ytdl-core";
import type {PageServerLoad} from "./$types";

export const load: PageServerLoad = async (params) => {
    const search = params.url.searchParams.get("q") || "Memories - Maroon 5";
    const [result] = await youtubeMusic.searchSongs(search);
    const songInfo = await ytdl.getInfo(result.videoId);
    const format = ytdl.chooseFormat(songInfo.formats, { quality: "highestaudio", filter: "audioonly" });

    return {
        song: {
            ...result,
            url: format.url,
        },
    };
};
