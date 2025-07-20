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

    // Check if metadata extraction failed (all fields are null)
    const hasMetadata = metadata.title || metadata.description || metadata.image_url;
    
    if (!hasMetadata) {
      // Insert article with minimal data and return special response
      const { data: article, error } = await supabase
        .from('ArticleReadingList')
        .insert({
          url,
          title: null,
          description: null,
          image_url: null,
          status: 'to_be_read'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
      }

      // Return special response indicating metadata is needed
      return NextResponse.json({ 
        article, 
        needsMetadata: true,
        message: 'Article added but metadata extraction failed. Please add title manually.'
      });
    }

    // Insert the article into the database with extracted metadata
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

export async function PATCH(request: NextRequest) {
  try {
    const { id, title, description } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: 'Article ID and title are required' }, { status: 400 });
    }

    // Update the article with manual metadata
    const { data: article, error } = await supabase
      .from('ArticleReadingList')
      .update({
        title,
        description: description || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 