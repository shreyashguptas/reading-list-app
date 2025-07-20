import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('ArticleReadingList')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Database error:', totalError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('ArticleReadingList')
      .select('status');

    if (statusError) {
      console.error('Database error:', statusError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    // Calculate status counts
    const toBeReadCount = statusCounts?.filter(article => article.status === 'to_be_read').length || 0;
    const inProgressCount = statusCounts?.filter(article => article.status === 'in_progress').length || 0;
    const finishedCount = statusCounts?.filter(article => article.status === 'finished').length || 0;

    // Calculate completion percentage
    const completionPercentage = totalCount ? Math.round((finishedCount / totalCount) * 100) : 0;

    return NextResponse.json({
      total: totalCount || 0,
      toBeRead: toBeReadCount,
      inProgress: inProgressCount,
      finished: finishedCount,
      completionPercentage
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 