'use client';

import { useState } from 'react';
import { Heart, User, Lock, LogIn, Stethoscope, Users, Shield, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg pattern-dots">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-scale-in">
        {/* Main Card */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          {/* Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              {/* Logo */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-xl shadow-primary/15 border border-primary/10">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-background">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">ICU Virtual Visit</h1>
                <p className="text-muted-foreground mt-2 font-medium">
                  Connect with your loved ones safely
                </p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('nurse')}
                className={cn(
                  "group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                  role === 'nurse'
                    ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/15"
                    : "border-border/50 bg-card/50 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                  role === 'nurse'
                    ? "bg-primary/20 shadow-md shadow-primary/20"
                    : "bg-muted group-hover:bg-primary/10"
                )}>
                  <Stethoscope className={cn(
                    "w-7 h-7 transition-colors duration-300",
                    role === 'nurse' ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-sm transition-colors duration-300",
                  role === 'nurse' ? "text-primary" : "text-foreground"
                )}>Healthcare Staff</span>
                {role === 'nurse' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setRole('family')}
                className={cn(
                  "group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                  role === 'family'
                    ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/15"
                    : "border-border/50 bg-card/50 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                  role === 'family'
                    ? "bg-primary/20 shadow-md shadow-primary/20"
                    : "bg-muted group-hover:bg-primary/10"
                )}>
                  <Users className={cn(
                    "w-7 h-7 transition-colors duration-300",
                    role === 'family' ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold text-sm transition-colors duration-300",
                  role === 'family' ? "text-primary" : "text-foreground"
                )}>Family Member</span>
                {role === 'family' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </div>

            {/* Form */}
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
                    className="pl-12 h-14 text-base rounded-xl border-border/50 bg-card/50 focus:border-primary/50 focus:bg-card transition-all duration-300"
                    autoComplete="username"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
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
                    className="pl-12 h-14 text-base rounded-xl border-border/50 bg-card/50 focus:border-primary/50 focus:bg-card transition-all duration-300"
                    autoComplete="current-password"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-up">
                  <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-destructive" />
                  </div>
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base font-semibold rounded-xl btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Spinner className="w-5 h-5 mr-3" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground pt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
