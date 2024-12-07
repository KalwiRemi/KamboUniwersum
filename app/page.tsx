import { unstable_cache, unstable_noStore } from 'next/cache';
import { Video } from '@/actions/fetchYoutubeVideos'
import { fetchAllChannelVideos } from '../utils/fetchYoutubeVideos';
import VideoList from './components/VideoList';

const getVideos = unstable_cache(
  fetchAllChannelVideos,
  ['videos'],
  { revalidate: 300, tags: ['videos'] }
);

export default async function Home() {
  unstable_noStore();
  try {
    const videos: Video[] = await getVideos();

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
