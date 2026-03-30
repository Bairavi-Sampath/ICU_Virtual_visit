'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'nurse' | 'family' | null;

interface User {
  username: string;
  role: UserRole;
  patientId?: string; // For family members
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation (in production, this would call a real API)
    if (username.length >= 3 && password.length >= 4) {
      let patientId: string | undefined;
      if (role === 'family') {
        try {
          const response = await fetch(`/api/family/default-patient?username=${encodeURIComponent(username)}`);
          if (response.ok) {
            const data = await response.json();
            patientId = data.patientId ?? undefined;
          }
        } catch {
          patientId = undefined;
        }
      }

      setUser({
        username,
        role,
        patientId
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: user !== null 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
