import { Video } from '@/actions/fetchYoutubeVideos';
import VideoCard from './VideoCard';

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.link} video={video} />
      ))}
    </div>
  );
}

