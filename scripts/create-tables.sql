-- Create posts table for storing post data
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  embed_code TEXT,
  media_url TEXT,
  media_type TEXT,
  redirect_link TEXT,
  native_banner_ad TEXT,
  popunder_ad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_links table for tracking generated links
CREATE TABLE IF NOT EXISTS generated_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_id TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_links_link_id ON generated_links(link_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
