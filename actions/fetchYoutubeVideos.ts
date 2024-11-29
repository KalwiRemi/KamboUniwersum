'use server';

import { parseStringPromise } from 'xml2js';

const CHANNEL_IDS = [
    'UC1v8Pb3mVVhctpado1zkY-Q', // raport
    'UCyFrUC936RTrwRjE0tEbZCQ', // popas
    'UCSpjys0fmiuKlKq1l_NgvnA', // wloczykij
    'UCgB0Zp12H3cEWnN5kkqXNMw', // filip
    'UC3CW1FJJM08ux8HF1eVpqvQ', // pod nowym niebem
    'UCfKGYjXohzOKDH0itYRZmgw', // waldi
    'UCVwO3pAsl8u88yeHX9zPGqA', // cebe
    'UCD1K3EhrvgFXb4U8vHBAs8w', // spocony
    'UCGt--eiSGtsDim-NxmLIrsw', // maniek
    'UCCzVeNj3KiUEqt_evIX-Hwg', // chinski prezesa
    'UC7r5cIA0t8naPg1bvjOA4eQ', // piękny roman
    'UCjbg2vx8eGFLaC3ekoVJLHg', // puzoniarze
    'UCja7PPlRxdxOttwudOu2BzQ', // leniwiec
    'UC1m795QiIJsKlA27s-RDHng', // mahan tv

    // commentary
    'UCiUKpAvUDZLbC33pP_jZ8MA', // boska palma
    'UC5dHYgxErrJpTA6Ww1i755w', // kambo shoty
    'UC7E-scxYJHi3lU8pzVSeKug', // palmowy raj
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
        .slice(0, 50);
    return sortedVideos;
}