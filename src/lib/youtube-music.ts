import YTMusic from "ytmusic-api";

// @ts-ignore
export const youtubeMusic = YTMusic.default ? new YTMusic.default() : new YTMusic();

await youtubeMusic.initialize();
