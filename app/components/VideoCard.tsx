import { Video } from '@/actions/fetchYoutubeVideos';

interface VideoCardProps {
    video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <a href={video.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-75 transition-opacity">
                <img
                    src={`https://img.youtube.com/vi/${video.link.split('v=')[1]}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                />
            </a>
            <div className="p-4">
                <h2 className="text-lg text-gray-600 font-semibold mb-2 line-clamp-2">{video.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{video.channelTitle}</p>
                <p className="text-xs text-gray-500">
                    <span>
                        {new Intl.RelativeTimeFormat('pl', { numeric: 'auto' }).format(
                            -Math.floor((new Date().getTime() - video.publishedAt.getTime()) / (1000 * 60 * 60 * 24)),
                            'days'
                        )}
                    </span>
                    {' '}
                    <span>
                        {video.publishedAt.toLocaleDateString()} {video.publishedAt.toLocaleTimeString()}
                    </span>
                </p>
            </div>
        </div>
    );
}
