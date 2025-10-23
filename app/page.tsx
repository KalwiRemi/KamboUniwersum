import { ChartLineIcon } from 'lucide-react'

import { Video } from '@/actions/fetchYoutubeVideos'
import { fetchAllChannelVideos } from '../utils/fetchYoutubeVideos';
import VideoList from './components/VideoList';

export const revalidate = 60;

export default async function Home() {
  try {
    const videos: Video[] = await fetchAllChannelVideos();

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-center mb-4">
          <h1 className="text-3xl font-bold">Kambo Uniwersum</h1>
          <a href="/stats" className="flex gap-4"><ChartLineIcon /> Statystyki</a>
        </div>
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
