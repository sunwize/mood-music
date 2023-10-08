import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import ytdl from "ytdl-core";
import axios from "axios";

export const GET: RequestHandler = async ({ params, request, setHeaders }: RequestEvent) => {
	const { videoId } = params;

	if (typeof videoId !== "string") throw error(400, `Invalid videoId => provided value: ${videoId}`);

	const songInfo = await ytdl.getInfo(videoId);
	const format = ytdl.chooseFormat(songInfo.formats, { quality: "highestaudio", filter: "audioonly" });

	if (!format.url) throw error(400, `Invalid format => provided value: ${format}`);

	// const { data: stream, headers } = await axios.get(format.url, {
	// 	responseType: "stream",
	// 	headers: {
	// 		"Origin": "https://music.youtube.com",
	// 		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
	// 	},
	// });

	setHeaders({
		"Accept-Ranges": "bytes",
		"Content-Type": "video/webm",
	});

	const range = request.headers.get("range");
	let status = 206;
	const options = {
		format,
		range: {
			start: 0,
			end: 0,
		},
	};

	if (range) {
		const fileSize = Number(format.contentLength);
		const parts = range.replace(/bytes=/, "").split("-");
		const start = Number(parts[0]);
		const end = parts[1] ? Number(parts[1]) : fileSize - 1;
		const chunkSize = (end - start) + 1;

		options.range.start = start;
		options.range.end = end;

		setHeaders({
			"Content-Length": String(chunkSize),
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
		});
	} else {
		setHeaders({
			"Content-Length": format.contentLength,
		});
		status = 200;
	}

	const stream = ytdl(`https://youtube.com/watch?v=${videoId}`, options) as unknown as BodyInit;

	return new Response(stream, {
		headers: {
			"Content-Length": format.contentLength,
		},
		status,
	});
};
