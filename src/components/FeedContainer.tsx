import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PostCard from './PostCard';
import { Loader, AlertTriangle, RefreshCw, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  content: string;
  type: 'image' | 'quote' | 'meme';
  image_url?: string;
  author?: string;
  created_at: string;
  survival_time_seconds: number;
  is_deleted: boolean;
}

const FeedContainer = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [totalDeleted, setTotalDeleted] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Sound effects
  const playDeleteSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIXBDWH0fPTgjMGKm7A7+OZRQ0PVqzn77BdGAg+ltryxHkpBSl+zPLZiTEHHGS57eGdTgwOUarm7bVmHgU2jdXzzn0vBSF1xe/eizEIGGq+6OOpVhMJR5/c7cB6JAU4iM/z1n4qBTB+ye7hmUYODlOq5O+zYBoGPJPY88p9KgUme8Xu3I4yBxpqvu7mnEoODU+q5e2yahoGOpHV8sp6KAUufsnw3Y8zCBpsvu/kolcTCUaZ2e/BdSMFMH/I8Nt9MQUbbc/u55xCDA5OpeTsrGIZBTaL0/PIeScELHfI8N+PNAUTY7zs5Z5MDg1No+XurWMaBDONz/PKeiYELXTL8N2TOAZ/jdHz0IEtBSV5xvLckzMGH2q39N+oVRIIRpfa7cB3JQUPX7jq4Z1FDE5GoeHsrGIZBDOLz+zIdSULFWS26+KNTE4PDc3t5qxqGAU1je/hm0cMEFWj4uyvWxYJMJbO8t+COgYWX7vs3o4+CMRtYvW7uWH5rBULKVPdzsWgLdYu4C3VfBMdl7ZLhvn6nIhIvzl3+I6tQUO5jbGg5Wbw2YfGJlEY6i85j6Y1oY4WGiUGrk+1oJ4RYlKA5KqiAHJAAC8LCwLU3qgFCATQyOzYpOWn+WLQYQY1QBbgTHZDR7wH2ZTXAQaACPGGsxJ5oX5iq9+gOgBQYADQOgO8IjYXY8Q2MKRcGFMDLPvr9K9uLdvN47Zv6Fzb');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore if audio fails
  };

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "ERROR_LOADING_FEED",
        description: "Failed to load posts from the void.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete post function
  const handleDeletePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "ACCESS_DENIED",
        description: "Please login to delete posts.",
        variant: "destructive"
      });
      return;
    }

    setDeleting(prev => new Set([...prev, postId]));
    playDeleteSound();

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Mark post as deleted and log the deletion
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: profile.user_id
        })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Log the deletion in deletions table
      const { error: deletionError } = await supabase
        .from('deletions')
        .insert({
          post_id: postId,
          deleted_by: profile.user_id
        });

      if (deletionError) console.error('Error logging deletion:', deletionError);

      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      setTotalDeleted(prev => prev + 1);

      toast({
        title: "POST_TERMINATED",
        description: "Successfully deleted from the void.",
        className: "bg-terminal-surface border-neon-primary text-neon-primary"
      });

    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "DELETION_FAILED",
        description: "Unable to delete post from the void.",
        variant: "destructive"
      });
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts(); // Refresh posts on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-neon-primary font-orbitron text-xl animate-neon-pulse">
            LOADING_FEED...
          </div>
          <div className="flex justify-center">
            <Loader className="w-8 h-8 text-neon-dim animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-neon-dim mx-auto mb-6" />
          <h2 className="text-neon-primary font-orbitron text-xl mb-4">
            ACCESS_REQUIRED
          </h2>
          <p className="text-text-muted font-mono text-sm mb-6">
            Please login to access the deletion feed and join the void.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Stats Header */}
      <div className="mb-6 p-4 bg-terminal-surface border border-neon-dim/30 post-hover">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-neon-primary font-orbitron text-lg neon-glow">
            DELETION_FEED
          </h2>
          <button 
            onClick={fetchPosts}
            className="flex items-center space-x-1 text-xs text-neon-dim hover:text-neon-primary transition-colors button-glow"
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
              onClick={fetchPosts}
              className="bg-primary text-primary-foreground px-4 py-2 border border-neon-primary hover:bg-neon-dim/20 transition-all button-glow"
            >
              REFRESH_FEED
            </button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              type={post.type}
              content={post.content}
              imageUrl={post.image_url}
              author={post.author}
              timestamp={new Date(post.created_at)}
              survivedTime={post.survival_time_seconds}
              deletedBy={0} // This would need to be calculated from deletions table
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div className="mt-8 text-center text-xs text-text-muted font-mono">
        <div className="border-t border-terminal-border pt-4">
          VOID://DELETION_TERMINAL v2.1.337 | {posts.length} POSTS_REMAINING
        </div>
      </div>
    </div>
  );
};

export default FeedContainer;