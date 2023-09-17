export const formatSongTime = (time: number, totalTime: number) => {
    if (totalTime > 3600) {
        return new Date(time * 1000).toISOString().slice(11, 19);
    } else {
        return new Date(time * 1000).toISOString().slice(14, 19);
    }
};