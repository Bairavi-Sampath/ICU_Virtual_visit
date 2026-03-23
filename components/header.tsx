'use client';

import { Heart, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'ICU Virtual Visit' }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b-0 shadow-sm">
      <div className="container mx-auto px-4 h-18 flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm animate-float">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block font-medium">Healthcare Dashboard</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass-card">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-muted-foreground capitalize font-medium">{user.role}</p>
              </div>
            </div>
          )}
          
          {user && (
            <Button
              variant="outline"
              onClick={logout}
              className="gap-2 h-12 px-5 rounded-xl border-border/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/50 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline font-medium">Sign Out</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-11 w-11 rounded-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 ease-out",
        mobileMenuOpen ? "max-h-48 border-t border-border/30" : "max-h-0"
      )}>
        <div className="container mx-auto px-4 py-4 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-muted-foreground capitalize font-medium">{user.role}</p>
              </div>
            </div>
          )}
          
          {user && (
            <Button
              variant="outline"
              onClick={logout}
              className="w-full gap-2 h-12 rounded-xl border-border/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
