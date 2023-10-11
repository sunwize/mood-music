import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import axios from "axios";

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
	const imageUrl = url.searchParams.get("url");

	if (!imageUrl) throw error(400, "Missing required parameter: url");

	const { data: stream } = await axios.get(imageUrl, {
		responseType: "stream",
		headers: {
			Origin: "https://music.youtube.com",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "image/jpeg",
		},
	});
};
