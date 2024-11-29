'use server';

import { parseStringPromise } from 'xml2js';

const CHANNEL_IDS = [
    'UC1v8Pb3mVVhctpado1zkY-Q',
    'UCyFrUC936RTrwRjE0tEbZCQ'
];

export interface Video {
  title: string;
  link: string;
  publishedAt: Date;
  channelTitle: string;
}

async function fetchChannelVideos(channelId: string): Promise<Video[]> {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  const xmlData = await response.text();
  
  const result = await parseStringPromise(xmlData, { explicitArray: false });
  
  return result.feed.entry.map((entry: any) => ({
    title: entry.title,
    link: entry['link']['$']['href'],
    publishedAt: new Date(entry.published),
    channelTitle: entry['author']['name'],
  }));
}

export async function fetchYoutubeVideos(): Promise<Video[]> {
    const allVideos = await Promise.all(CHANNEL_IDS.map(fetchChannelVideos));
    const sortedVideos = allVideos
        .flat()
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);
    return sortedVideos;
}