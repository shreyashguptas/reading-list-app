import * as cheerio from 'cheerio';

export interface ArticleMetadata {
  title: string | null;
  description: string | null;
  image_url: string | null;
}

export async function extractMetadata(url: string): Promise<ArticleMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    let title: string | null = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                $('h1').first().text() ||
                null;

    // Extract description
    let description: string | null = $('meta[property="og:description"]').attr('content') ||
                     $('meta[name="twitter:description"]').attr('content') ||
                     $('meta[name="description"]').attr('content') ||
                     null;

    // Extract image
    let image_url: string | null = $('meta[property="og:image"]').attr('content') ||
                   $('meta[name="twitter:image"]').attr('content') ||
                   $('meta[property="og:image:secure_url"]').attr('content') ||
                   null;

    // Clean up the extracted data
    title = title?.trim() || null;
    description = description?.trim() || null;
    image_url = image_url?.trim() || null;

    // If image URL is relative, make it absolute
    if (image_url && !image_url.startsWith('http')) {
      const urlObj = new URL(url);
      image_url = new URL(image_url, urlObj.origin).href;
    }

    return { title, description, image_url };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: null,
      description: null,
      image_url: null
    };
  }
} 