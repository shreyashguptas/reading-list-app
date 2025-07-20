-- Create the ArticleReadingList table
CREATE TABLE IF NOT EXISTS "ArticleReadingList" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'to_be_read' CHECK (status IN ('to_be_read', 'in_progress', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_article_reading_list_status ON "ArticleReadingList"(status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_article_reading_list_created_at ON "ArticleReadingList"(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE "ArticleReadingList" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now - you can restrict this later)
CREATE POLICY "Allow all operations on ArticleReadingList" ON "ArticleReadingList"
    FOR ALL USING (true); 