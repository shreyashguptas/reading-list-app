import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractMetadata } from '@/lib/metadata';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if article already exists
    const { data: existingArticle } = await supabase
      .from('ArticleReadingList')
      .select('id')
      .eq('url', url)
      .single();

    if (existingArticle) {
      return NextResponse.json({ error: 'Article already exists' }, { status: 409 });
    }

    // Extract metadata from the URL
    const metadata = await extractMetadata(url);

    // Insert the article into the database
    const { data: article, error } = await supabase
      .from('ArticleReadingList')
      .insert({
        url,
        title: metadata.title,
        description: metadata.description,
        image_url: metadata.image_url,
        status: 'to_be_read'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('ArticleReadingList')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 