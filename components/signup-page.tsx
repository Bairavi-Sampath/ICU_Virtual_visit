'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Heart, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/toast-provider';

export function SignUpPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'nurse' | 'family'>('nurse');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          password: formData.password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Sign up failed');
        showToast(data.message || 'Sign up failed', 'error');
        return;
      }

      showToast('Account created successfully! Please sign in.', 'success');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg pattern-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4 shadow-lg shadow-primary/10">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ICU Virtual Visit</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl animate-scale-in">
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('nurse')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === 'nurse'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 hover:border-border/60'
                  }`}
                >
                  <div className="text-2xl mb-1">👨‍⚕️</div>
                  <div className="text-sm font-semibold">Healthcare Staff</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('family')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === 'family'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/40 hover:border-border/60'
                  }`}
                >
                  <div className="text-2xl mb-1">👨‍👩‍👧</div>
                  <div className="text-sm font-semibold">Family Member</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <Input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Username</label>
              <Input
                type="text"
                name="username"
                placeholder="john_doe"
                value={formData.username}
                onChange={handleInputChange}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-11 rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Confirm Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 text-base gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-primary font-semibold hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
