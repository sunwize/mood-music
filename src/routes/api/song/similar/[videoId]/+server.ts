import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import type { SongDetailed, SongFull } from "ytmusic-api";
import { error, json } from "@sveltejs/kit";

import { youtubeMusic } from "$lib/youtube-music";
import { levenshteinDistance } from "$lib/utils/levenshteinDistance";

type SongSuggestion = SongDetailed & { score: number };

const MAX_SCORE = 1000;
const RULES_AMOUNT = 5;
const BANNED_KEYWORDS = ["remix", "karaoke", "instrumental", "bass", "cover", "version", "lyric", "rewind", "live", "melody", "clip", "pov"];

const getScore = (currentSong: SongFull, similarSong: SongSuggestion, songHistory: SongDetailed[]) => {
	const percent = MAX_SCORE / RULES_AMOUNT;
	// TODO: Compare names
	let distance = levenshteinDistance(currentSong.name, similarSong.name);
	let score = MAX_SCORE - (percent - Math.min(distance, percent));

	// TODO: Compare artist
	const artists1 = currentSong.artists.map((artist) => artist.name);
	const artists2 = similarSong.artists?.map((artist) => artist.name);
	distance = levenshteinDistance(artists1.join(","), artists2?.join(","));
	score -= (percent - Math.min(distance, percent));

	// TODO: Search the artist in the name of title
	if (similarSong.name?.toLowerCase().includes(
		artists1.join().toLowerCase(),
	)) {
		score -= percent;
	}

	// TODO: Check if already played
	if (
		similarSong.videoId &&
		songHistory.map((song) => song.videoId)
			.includes(similarSong.videoId)
	) {
		score -= percent;
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

const getSimilarSong = async (currentSong: SongFull, songHistory: SongDetailed[]) => {
	const artistIds = currentSong.artists.map((artist) => artist.artistId);
	const suggestions: SongSuggestion[] = [];

	for (const artistId of artistIds) {
		try {
			const songs = await youtubeMusic.getArtistSongs(artistId);
			suggestions.push(
				...songs.map((song) => ({
					...song,
					score: 0,
				})),
			);
		} catch (error) {
			console.error(error);
		}
	}

	suggestions.forEach((suggestion) => suggestion.score = getScore(currentSong, suggestion, songHistory));
	suggestions.sort((song1, song2) => song2.score - song1.score);

	for (const suggestion of suggestions) {
		if (suggestion.videoId) {
			let song: SongFull;

			try {
				song = await youtubeMusic.getSong(suggestion.videoId);
			} catch {
				console.log(`Could not fetch ${suggestion.name}`);
				continue;
			}

			if (song) {
				return song;
			}
		}
	}

	return null;
};

export const POST: RequestHandler = async ({ params, request }: RequestEvent) => {
	const { videoId } = params;
	const { songHistory }: { songHistory: SongDetailed[] } = await request.json();

	if (typeof videoId !== "string") throw error(400, `Invalid videoId => provided value: ${videoId}`);

	const song = await youtubeMusic.getSong(videoId);
	const similarSong = await getSimilarSong(song, songHistory);

	return json({
		song: similarSong,
	});
};
