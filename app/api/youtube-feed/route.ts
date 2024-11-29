import { NextResponse } from 'next/server';
import { fetchYoutubeVideos } from '@/actions/fetchYoutubeVideos';

export async function GET() {
  try {
    const videos = await fetchYoutubeVideos();
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching YouTube feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube feeds' }, { status: 500 });
  }
}

export const revalidate = 300; // Revalidate every 5 minutes
