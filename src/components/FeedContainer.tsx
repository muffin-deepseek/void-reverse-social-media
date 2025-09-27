import { useState, useEffect, useMemo } from 'react';
import PostCard from './PostCard';
import { RefreshCw, Database, Trash2 } from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import meme1 from '@/assets/meme-1.png';
import quote1 from '@/assets/quote-1.png';
import pixelCat from '@/assets/pixel-cat.png';

interface Post {
  id: string;
  type: 'image' | 'quote' | 'meme';
  content: string;
  imageUrl?: string;
  author?: string;
  timestamp: Date;
  survivedTime: number;
  deletedBy: number;
}

const FeedContainer = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDeleted, setTotalDeleted] = useState(0);

  // Sample data for the demo
  const samplePosts: Omit<Post, 'id' | 'timestamp' | 'survivedTime' | 'deletedBy'>[] = useMemo(() => [
    {
      type: 'meme',
      content: 'When you realize you\'ve been scrolling for 3 hours straight',
      imageUrl: meme1,
    },
    {
      type: 'quote',
      content: 'The best way to predict the future is to create it.',
    },
    {
      type: 'image',
      content: 'Cyberpunk cat vibes',
      imageUrl: pixelCat,
    },
    {
      type: 'quote',
      content: 'In a world of ones and zeros, be the glitch.',
    },
    {
      type: 'meme',
      content: 'ERROR 404: Motivation not found. Please restart human.exe',
    },
    {
      type: 'quote',
      content: 'Code is poetry written in logic.',
    },
    {
      type: 'image',
      content: 'Terminal aesthetic vibes',
      imageUrl: quote1,
    },
  ], []);

  // Initialize posts with realistic survival times
  useEffect(() => {
    const initializePosts = () => {
      const initialPosts: Post[] = samplePosts.map((post, index) => ({
        ...post,
        id: `post_${Date.now()}_${index}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time up to 1 hour ago
        survivedTime: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        deletedBy: Math.floor(Math.random() * 50) + 5, // 5-55 deletions
      }));

      setPosts(initialPosts);
      setIsLoading(false);
    };

    // Simulate loading delay
    setTimeout(initializePosts, 1000);
  }, [samplePosts]);

  // Update survival times every second
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(currentPosts => 
        currentPosts.map(post => ({
          ...post,
          survivedTime: post.survivedTime + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDeletePost = (postId: string) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    setTotalDeleted(prev => prev + 1);
  };

  const addRandomPost = () => {
    soundEffects.playSuccessSound();
    const randomPost = samplePosts[Math.floor(Math.random() * samplePosts.length)];
    const newPost: Post = {
      ...randomPost,
      id: `post_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      survivedTime: 0,
      deletedBy: 0,
    };

    setPosts(currentPosts => [newPost, ...currentPosts]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-neon-primary font-orbitron text-xl animate-neon-pulse">
            LOADING_FEED...
          </div>
          <div className="flex justify-center">
            <RefreshCw className="w-8 h-8 text-neon-dim animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Stats Header */}
      <div className="mb-6 p-4 bg-terminal-surface border border-neon-dim/30">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-neon-primary font-orbitron text-lg neon-glow">
            DELETION_FEED
          </h2>
          <button 
            onClick={addRandomPost}
            className="button-hover flex items-center space-x-1 text-xs text-neon-dim hover:text-neon-primary transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>REFRESH</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3 text-neon-dim" />
            <span className="text-text-muted">ACTIVE: </span>
            <span className="text-neon-primary">{posts.length}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Trash2 className="w-3 h-3 text-destructive" />
            <span className="text-text-muted">DELETED: </span>
            <span className="text-destructive">{totalDeleted}</span>
          </div>
          
          <div className="text-text-muted">
            EFFICIENCY: <span className="text-neon-primary">
              {posts.length > 0 ? Math.round((totalDeleted / (totalDeleted + posts.length)) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neon-primary font-orbitron mb-2">
              FEED_CLEARED
            </div>
            <div className="text-text-muted text-sm mb-4">
              All posts have been deleted. The void is complete.
            </div>
            <button 
              onClick={addRandomPost}
              className="button-hover bg-primary text-primary-foreground px-4 py-2 border border-neon-primary hover:bg-neon-dim/20 transition-all"
            >
              GENERATE_NEW_POSTS
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...post}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="mt-8 text-center text-xs text-text-muted font-mono">
        <div className="border-t border-terminal-border pt-4">
          VOID://DELETION_TERMINAL v1.0.0 | {posts.length} POSTS_REMAINING
        </div>
      </div>
    </div>
  );
};

export default FeedContainer;