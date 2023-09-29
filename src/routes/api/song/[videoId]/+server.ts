import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import ytdl from "ytdl-core";

import { youtubeMusic } from "$lib/youtube-music";

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const { videoId } = params;

	if (typeof videoId !== "string") throw error(400, `Invalid videoId => provided value: ${videoId}`);

	const song = await youtubeMusic.getSong(videoId);
	const songInfo = await ytdl.getInfo(song.videoId);

	const format = ytdl.chooseFormat(songInfo.formats, { quality: "highestaudio", filter: "audioonly" });

	return json({
		song: {
			...song,
			url: format.url,
		},
	});
};
