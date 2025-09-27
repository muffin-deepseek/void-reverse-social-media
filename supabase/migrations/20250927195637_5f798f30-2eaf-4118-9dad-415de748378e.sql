-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for the social content
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'quote', 'meme')),
  image_url TEXT,
  author TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  survival_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deletions table to track deletion history
CREATE TABLE public.deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  deleted_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for posts
CREATE POLICY "Users can view non-deleted posts" ON public.posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "Users can update posts to delete them" ON public.posts FOR UPDATE USING (is_deleted = false);

-- Create policies for deletions
CREATE POLICY "Users can view all deletions" ON public.deletions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own deletions" ON public.deletions FOR INSERT WITH CHECK (auth.uid() = deleted_by);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate survival time when post is deleted
CREATE OR REPLACE FUNCTION public.calculate_survival_time()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate survival time in seconds
  NEW.survival_time_seconds = EXTRACT(EPOCH FROM (NEW.deleted_at - NEW.created_at))::INTEGER;
  RETURN NEW;
END;
$$;

-- Create trigger to calculate survival time
CREATE TRIGGER calculate_post_survival_time
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  WHEN (OLD.is_deleted = false AND NEW.is_deleted = true)
  EXECUTE FUNCTION public.calculate_survival_time();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample posts data
INSERT INTO public.posts (content, type, image_url, author) VALUES
('The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.', 'quote', null, 'Albert Camus'),
('404: Life not found. Please try again later.', 'meme', '/src/assets/meme-1.png', 'Anonymous'),
('In cyberspace, no one can hear you scream... except the NSA.', 'quote', null, 'Cyber Prophet'),
('When you finally fix that bug that''s been haunting you for weeks', 'meme', '/src/assets/pixel-cat.png', 'DevLife'),
('The future is not some place we are going, but one we are creating.', 'quote', '/src/assets/quote-1.png', 'John Schaar');