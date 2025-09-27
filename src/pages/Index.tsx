import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FeedContainer from "@/components/FeedContainer";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-neon-primary font-mono text-lg mb-4">
            INITIALIZING_VOID...
          </div>
          <div className="w-2 h-2 bg-neon-primary rounded-full animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <FeedContainer />
    </div>
  );
};

export default Index;