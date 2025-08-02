-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT likes_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE,
    
    CONSTRAINT likes_post_id_fkey 
    FOREIGN KEY (post_id) 
    REFERENCES public.posts(id) 
    ON DELETE CASCADE,
    
    -- Ensure one like per user per post
    UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE,
    
    CONSTRAINT comments_post_id_fkey 
    FOREIGN KEY (post_id) 
    REFERENCES public.posts(id) 
    ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

-- Enable RLS on new tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for comments updated_at
CREATE TRIGGER handle_updated_at_comments
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a view for posts with interaction counts
CREATE OR REPLACE VIEW public.posts_with_counts AS
SELECT 
    p.*,
    COALESCE(like_counts.like_count, 0) as like_count,
    COALESCE(comment_counts.comment_count, 0) as comment_count
FROM public.posts p
LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM public.likes
    GROUP BY post_id
) like_counts ON p.id = like_counts.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM public.comments
    GROUP BY post_id
) comment_counts ON p.id = comment_counts.post_id;
