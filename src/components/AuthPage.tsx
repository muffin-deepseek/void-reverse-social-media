import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus, Terminal } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      toast({
        title: "ACCOUNT_CREATED",
        description: "Check your email to confirm your account.",
        className: "bg-terminal-surface border-neon-primary text-neon-primary"
      });
    } catch (error: any) {
      toast({
        title: "SIGN_UP_ERROR",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "ACCESS_GRANTED",
        description: "Welcome back to the Void.",
        className: "bg-terminal-surface border-neon-primary text-neon-primary"
      });
    } catch (error: any) {
      toast({
        title: "LOGIN_ERROR", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Terminal className="w-8 h-8 text-neon-primary mr-2" />
            <h1 className="text-2xl font-orbitron font-bold text-neon-primary neon-glow">
              VOID_ACCESS
            </h1>
          </div>
          <p className="text-text-dim text-sm font-mono">
            ENTER THE DIGITAL WASTELAND
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-terminal-surface border border-terminal-border p-6 neon-border">
          <div className="flex mb-6">
            <Button
              variant={isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(true)}
              className="flex-1 mr-2 button-glow"
            >
              <User className="w-4 h-4 mr-2" />
              LOGIN
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
              className="flex-1 ml-2 button-glow"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              SIGN_UP
            </Button>
          </div>

          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-neon-primary font-mono text-xs">
                  USERNAME_ID
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-terminal-bg border-terminal-border text-text-neon font-mono"
                  placeholder="cyber_user_001"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-neon-primary font-mono text-xs">
                EMAIL_ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-terminal-bg border-terminal-border text-text-neon font-mono"
                placeholder="user@void.net"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-neon-primary font-mono text-xs">
                ACCESS_CODE
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-terminal-bg border-terminal-border text-text-neon font-mono"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full button-glow"
            >
              {loading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                `${isLogin ? 'INITIATE_LOGIN' : 'CREATE_ACCOUNT'}`
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted font-mono">
            <div className={`inline-block animate-pulse ${loading ? 'text-neon-primary' : ''}`}>
              [ {loading ? 'ACCESSING_MAINFRAME' : 'READY_FOR_INPUT'} ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;