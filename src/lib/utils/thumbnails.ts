enum THUMBNAIL_SIZE {
	SMALL = 150,
	MEDIUM = 300,
	LARGE = 500,
}

const getImageProxyUrl = (url: string) => `/api/proxy/image?url=${encodeURIComponent(url)}`;
export const getThumbnailSize = (thumbnailUrl: string, size: number) => getImageProxyUrl(thumbnailUrl.split("=w")[0] + `=w${size}-h${size}-l90-rj`);
export const getSmallThumbnail = (thumbnailUrl: string) => getThumbnailSize(thumbnailUrl, THUMBNAIL_SIZE.SMALL);
export const getLargeThumbnail = (thumbnailUrl: string) => getThumbnailSize(thumbnailUrl, THUMBNAIL_SIZE.LARGE);
