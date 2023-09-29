import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import type { relatedVideo } from "ytdl-core";
import type { SongFull } from "ytmusic-api";
import { error, json } from "@sveltejs/kit";
import ytdl from "ytdl-core";

import { youtubeMusic } from "$lib/youtube-music";
import { levenshteinDistance } from "$lib/utils/levenshteinDistance";

const MAX_SCORE = 1000;
const RULES_AMOUNT = 5;
const BANNED_KEYWORDS = ["remix", "karaoke", "instrumental", "bass", "cover", "version", "lyric", "rewind", "live"];

const getScore = (currentSong: SongFull, similarSong: relatedVideo) => {
	const percent = MAX_SCORE / RULES_AMOUNT;
	// TODO: Compare names
	let distance = levenshteinDistance(currentSong.name, similarSong.title);
	let score = MAX_SCORE - (percent - Math.min(distance, percent));

	// TODO: Compare artist
	const artists1 = currentSong.artists.map((artist) => artist.name);
	const artists2 = typeof similarSong.author === "string" ? similarSong.author : similarSong.author.name;
	distance = levenshteinDistance(artists1.join(","), artists2);
	score -= (percent - Math.min(distance, percent));

	// TODO: Search the artist in the name of title
	if (similarSong.title?.toLowerCase().includes(
		artists1.join().toLowerCase(),
	)) {
		score -= percent;
	}

	// TODO: Check if already played

	// TODO: Check for the duration
	if (!similarSong.length_seconds) {
		score -= percent;
	} else {
		const minutes = Math.floor(similarSong.length_seconds / 60);
		const scoreToRemove = Math.min((percent * 5 / 100) * Math.max(minutes - 5, 0), percent);
		score -= scoreToRemove;
	}

	// TODO: Check for the banned keywords
	BANNED_KEYWORDS.forEach((bannedWord) => {
		if (currentSong.name.toLowerCase().includes(bannedWord)) {
			score -= percent;
			return;
		}
	});

	return score;
};

const getSimilarSong = async (currentSong: SongFull, relatedVideos: relatedVideo[]) => {
	const suggestions: Array<relatedVideo & { score: number }> = relatedVideos.map((video) => ({
		...video,
		score: 0,
	}));

	for (const video of suggestions) {
		video.score = getScore(currentSong, video);
	}

	suggestions.sort((video1, video2) => video2.score - video1.score);

	const nextSongs = suggestions.slice(0, 3).map((video) => ({
		title: video.title,
		score: video.score,
		duration: video.length_seconds,
	}));

	console.log("Next playing");
	console.log(nextSongs[0]);

	for (const video of suggestions) {
		if (video.id) {
			let song: SongFull;

			try {
				song = await youtubeMusic.getSong(video.id);
			} catch {
				console.log(`Could not fetch ${video.title}`);
				continue;
			}

			if (song) {
				return song;
			}
		}
	}

	return null;
};

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const { videoId } = params;

	if (typeof videoId !== "string") throw error(400, `Invalid videoId => provided value: ${videoId}`);

	const song = await youtubeMusic.getSong(videoId);
	const songInfo = await ytdl.getInfo(videoId);
	const similarSong = await getSimilarSong(song, songInfo.related_videos);

	return json({
		song: similarSong,
	});
};
