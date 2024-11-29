import { fetchYoutubeVideos, Video } from "@/actions/fetchYoutubeVideos";

export async function fetchAllChannelVideos(): Promise<Video[]> {
    const videos = await fetchYoutubeVideos();
    return videos.map((video: any) => ({
        ...video,
        publishedAt: new Date(video.publishedAt),
    }));
}

export async function fetchAllChannelVideosAPI(): Promise<Video[]> {
    const response = await fetch('/api/youtube-feed', { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error('Failed to fetch YouTube feeds');
    }
    const videos = await response.json();
    return videos.map((video: any) => ({
      ...video,
      publishedAt: new Date(video.publishedAt),
    }));
  }