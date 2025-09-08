import moment from 'moment';
import { Video } from '@/actions/fetchYoutubeVideos';

import 'moment/locale/pl';

moment.locale('pl');

const VIDEO_ID_REGEX = /watch\?v=([a-zA-Z0-9\-_]+)/;
const SHORT_ID_REGEX = /shorts\/([a-zA-Z0-9\-_]+)/;

interface VideoCardProps {
    video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
    const idMatch = video.link.match(VIDEO_ID_REGEX) || video.link.match(SHORT_ID_REGEX);
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <a href={video.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-75 visited:opacity-50 transition-opacity">
                <img
                    src={`https://img.youtube.com/vi/${idMatch?.[1]}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                />
            </a>
            <div className="p-4 space-y-2">
                <h2 className="text-lg text-gray-600 font-semibold mb-2 line-clamp-2 min-h-12 leading-6">{video.title}</h2>
                <p className="text-sm text-gray-600 mb-2 flex w-full justify-between">
                    <span>{video.channelTitle}</span>
                </p>
                <p className="text-xs text-gray-500 flex w-full justify-between">
                    <span title={moment(video.publishedAt).format('dddd DD/MM/YYYY HH:mm')}>
                        {moment(video.publishedAt).fromNow()}
                    </span>
                    <span>{video.views.toLocaleString('pl-PL')} wyświetleń</span>
                </p>
            </div>
        </div>
    );
}
