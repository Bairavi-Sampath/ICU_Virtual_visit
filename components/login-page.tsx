'use client';

import { useState } from 'react';
import { Heart, User, Lock, LogIn, Stethoscope, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('nurse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const success = await login(username, password, role);
    setLoading(false);

    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/8 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          {/* Top gradient accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-accent" />
          
          <div className="p-8 pt-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 shadow-lg shadow-primary/10 animate-float">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">ICU Virtual Visit</h1>
              <p className="text-muted-foreground font-medium">
                Connect with your loved ones safely
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('nurse')}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                  role === 'nurse'
                    ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-lg shadow-primary/10"
                    : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  role === 'nurse' 
                    ? "bg-primary/20" 
                    : "bg-muted/50"
                )}>
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Healthcare Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('family')}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                  role === 'family'
                    ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-lg shadow-primary/10"
                    : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  role === 'family' 
                    ? "bg-primary/20" 
                    : "bg-muted/50"
                )}>
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Family Member</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-12 h-14 text-base rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all duration-300"
                    autoComplete="username"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 h-14 text-base rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all duration-300"
                    autoComplete="current-password"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400 font-medium animate-slide-up">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 rounded-xl btn-premium"
              >
                {loading ? (
                  <>
                    <Spinner className="w-5 h-5 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6 font-medium">
          Powered by ICU Virtual Visit Healthcare Platform
        </p>
      </div>
    </div>
  );
}
