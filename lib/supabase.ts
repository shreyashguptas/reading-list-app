import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Article {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  status: 'to_be_read' | 'in_progress' | 'finished';
  created_at: string;
  updated_at: string;
} 