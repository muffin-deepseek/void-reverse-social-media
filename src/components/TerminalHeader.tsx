import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Terminal, LogOut, User } from 'lucide-react';

const TerminalHeader = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [onlineUsers] = useState<number>(Math.floor(Math.random() * 1000) + 100);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'UTC' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="border-b border-terminal-border bg-terminal-surface sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Terminal Prompt */}
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-neon-primary" />
            <span className="text-neon-primary font-orbitron text-xl font-bold neon-glow">
              VOID://
            </span>
            <span className="text-text-dim">deletion_terminal</span>
            <span className="terminal-cursor"></span>
          </div>

          {/* Center: Status */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-primary rounded-full animate-neon-pulse"></div>
              <span className="text-text-dim">SYSTEM ACTIVE</span>
            </div>
            <div className="text-text-muted">
              USERS_ONLINE: <span className="text-neon-primary">{onlineUsers}</span>
            </div>
            <div className="text-text-muted">
              UTC_TIME: <span className="text-neon-primary">{currentTime}</span>
            </div>
          </div>

          {/* Right: Auth Status */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
                  <User className="w-4 h-4 text-neon-dim" />
                  <span className="text-neon-dim">
                    {user.email?.split('@')[0]?.toUpperCase()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="button-glow"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  LOGOUT
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/auth')}
                className="button-glow"
              >
                <User className="w-4 h-4 mr-1" />
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TerminalHeader;