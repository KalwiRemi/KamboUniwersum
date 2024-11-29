import { Video } from '@/actions/fetchYoutubeVideos'
import { fetchAllChannelVideos } from '../utils/fetchYoutubeVideos';
import VideoList from './components/VideoList';

export const revalidate = 300; // 300 seconds = 5 minutes

export default async function Home() {
  try {
    const videos: Video[] = await fetchAllChannelVideos();

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kambo Uniwersum</h1>
        <VideoList videos={videos} />
      </main>
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kambo Uniwersum</h1>
        <p className="text-red-500">Failed to load videos. Please try again later.</p>
      </main>
    );
  }
}
