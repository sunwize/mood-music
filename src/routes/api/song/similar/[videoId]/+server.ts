import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import type { SongDetailed, SongFull } from "ytmusic-api";
import { error, json } from "@sveltejs/kit";

import { youtubeMusic } from "$lib/youtube-music";
import { shuffle } from "$lib/utils/shuffle";

type SongSuggestion = {
	song: SongDetailed
	score: number
};

const getSimilarSong = async (currentSong: SongFull, songHistory: SongDetailed[]) => {
	const [{ artistId }] = currentSong.artists;
	let songSuggestions: SongSuggestion[] = [];

	if (!artistId) return null;

	try {
		const artist = await youtubeMusic.getArtist(artistId);

		if (artist.featuredOn.length > 0) {
			const playlistInfo = shuffle(artist.featuredOn)[0];
			const videos = await youtubeMusic.getPlaylistVideos(playlistInfo.playlistId);

			songSuggestions.push(
				...videos.map((video) => ({
                    song: {
                        ...video,
                        type: "SONG",
                        album: {
                            albumId: "",
                            name: "",
                        },
                    } as SongDetailed,
                    score: 0,
                })),
			);
		} else {
			const similarArtists = shuffle(artist.similarArtists).slice(0, 3);

			for (const similarArtist of similarArtists) {
				const a = await youtubeMusic.getArtist(similarArtist.artistId);
				songSuggestions.push(
					...a.topSongs
						.slice(0, 5)
						.map((song) => ({
							song: {
								...song,
								duration: 0,
							},
							score: 0,
						})),
				);
			}
		}
	} catch (error) {
		console.error(error);
	}

	const songHistoryIds = songHistory.map((song) => song.videoId);

    songSuggestions = songSuggestions.filter((suggestion) => !songHistoryIds.includes(suggestion.song.videoId));
	songSuggestions = shuffle(songSuggestions);

	for (const songSuggestion of songSuggestions) {
		if (songSuggestion.song.videoId) {
			let song: SongFull;

			try {
				song = await youtubeMusic.getSong(songSuggestion.song.videoId);
			} catch {
				console.log(`Could not fetch ${songSuggestion.song.name}`);
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
