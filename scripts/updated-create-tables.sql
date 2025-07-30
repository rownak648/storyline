-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS generated_links CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create posts table for storing post data
CREATE TABLE posts (
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
CREATE TABLE generated_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_id TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_generated_links_link_id ON generated_links(link_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_links ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for this demo)
CREATE POLICY "Allow public access to posts" ON posts FOR ALL USING (true);
CREATE POLICY "Allow public access to generated_links" ON generated_links FOR ALL USING (true);

-- Insert some test data to verify everything works
INSERT INTO posts (title, description, redirect_link) VALUES 
('Test Post', 'This is a test post to verify the setup', 'https://example.com');

INSERT INTO generated_links (post_id, link_id, title) VALUES 
((SELECT id FROM posts WHERE title = 'Test Post'), 'test123', 'Test Post');
