import { ChartLineIcon } from 'lucide-react'
import Image from 'next/image';
import type { Metadata } from 'next';

import { Video } from '@/actions/fetchYoutubeVideos'
import { fetchAllChannelVideos } from '../utils/fetchYoutubeVideos';
import VideoList from './components/VideoList';
import { siteConfig } from '@/utils/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Najnowsze filmy',
  description: 'Aktualna lista najnowszych filmów z kanałów kambodżańskiego uniwersum.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kambo Uniwersum - najnowsze filmy',
    description: 'Sprawdź najnowsze filmy z wybranych kanałów i przejdź do statystyk.',
    url: '/',
    type: 'website',
    locale: 'pl_PL',
  },
}

export default async function Home() {
  try {
    const videos: Video[] = await fetchAllChannelVideos();
    const newestPublishedAt = videos[0]?.publishedAt;
    const collectionPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Najnowsze filmy',
      description: 'Zbiór najnowszych filmów z kambodżańskiego uniwersum YouTube.',
      url: siteConfig.url,
      inLanguage: 'pl-PL',
      dateModified: newestPublishedAt ? new Date(newestPublishedAt).toISOString() : undefined,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: videos.slice(0, 10).map((video, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: video.title,
          url: video.link,
        })),
      },
    };

    return (
      <main className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
        />
        <div className="flex gap-8 items-center mb-4">
          <div className="flex gap-2 items-center">
            <Image
              src="/web-app-manifest-192x192.png"
              width={64}
              height={64}
              alt="Logo"
            />
            <h1 className="text-3xl font-bold">Kambo Uniwersum</h1>
          </div>
          <a href="/stats" className="flex gap-2"><ChartLineIcon /> Statystyki</a>
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
