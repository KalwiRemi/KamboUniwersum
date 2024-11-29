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
    'UCBX_bo0X95HAjxrX9qmrAnQ', // cambo life
    'UCMXCt1oy4XlAqqvCgAf8QSw', // chemik z phnom penh
    'UCAQad5B9IiU9rQBY3OE2Kbg', // tymon
    'UCtcaHt553DRzaEiDqu-fdpA', // krokodylarz
    'UCDh5eO_itbIPEs4nBge3KVA', // rio w azji
    'UCrg63Ahih2yn1Gex9M-pkJg', // tharong kitchen
    'UCWZHJzo-0Rn_qE4Iz7fA8hA', // cambodia follow my dream
    'UC1SPkZIRegQ1uk48qoPLz5Q', // ucieczka do raju
    'UCVfQ-lw8uTNV9vJe6ibKXCA', // hanys

    // commentary
    'UCiUKpAvUDZLbC33pP_jZ8MA', // boska palma
    'UC5dHYgxErrJpTA6Ww1i755w', // kambo shoty
    'UC7E-scxYJHi3lU8pzVSeKug', // palmowy raj
    'UCVVS8eujGeT4RmZ6e9nPM4Q', // billy
    'UCZl9qeCivAGBZkD7ETZKNOw', // malpa klapek
];

export interface Video {
  title: string;
  link: string;
  publishedAt: Date;
  channelTitle: string;
  views: number;
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
    views: parseInt(entry['media:group']['media:community']['media:statistics'].$.views, 10),
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