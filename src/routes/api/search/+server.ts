import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import { youtubeMusic } from "$lib/youtube-music";

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
	const query = url.searchParams.get("query");

	if (!query) throw error(400, "Missing required parameter: query");

	const results = await youtubeMusic.searchSongs(query);

	return json(results);
};
