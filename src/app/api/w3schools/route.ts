import { NextRequest, NextResponse } from 'next/server';
import { fetchW3Content } from '@/lib/w3schools-fetcher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // Validate URL is from w3schools.com
  if (!url.includes('w3schools.com')) {
    return NextResponse.json({ error: 'Only w3schools.com URLs allowed' }, { status: 400 });
  }

  const content = await fetchW3Content(url);

  if (!content) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }

  return NextResponse.json(content);
}
