export interface Thumbnail {
	url: string
	width: number
	height: number
}

export interface Song {
	videoId: string
	name: string
	url: string
	thumbnails: Thumbnail[]
	artists: {name: string, artistId: string}[]
	album?: {name: string, albumId: string}
	duration: number
}
