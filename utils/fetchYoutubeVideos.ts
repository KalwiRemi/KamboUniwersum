import { fetchYoutubeVideos, Video } from "@/actions/fetchYoutubeVideos";

export async function fetchAllChannelVideos(): Promise<Video[]> {
    const videos = await fetchYoutubeVideos();
    return videos;
}

export async function fetchAllChannelVideosAPI(): Promise<Video[]> {
    const response = await fetch('/api/youtube-feed', { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube feeds');
    }
    const videos = await response.json();
    return videos;
  }