import { useState, useEffect } from 'react';

const TerminalHeader = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [onlineUsers] = useState<number>(Math.floor(Math.random() * 1000) + 100);

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

  return (
    <header className="border-b border-terminal-border bg-terminal-surface">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Terminal Prompt */}
          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-2">
            <span className="text-text-dim text-sm">GUEST_MODE</span>
            <div className="w-8 h-8 border border-neon-dim bg-terminal-surface flex items-center justify-center">
              <span className="text-neon-dim text-xs">?</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TerminalHeader;