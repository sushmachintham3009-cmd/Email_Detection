import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: { name: string; role: string }) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  rememberedEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rememberedEmail, setRememberedEmail] = useState<string>('');

  useEffect(() => {
    // Check initial auth state
    const initAuth = async () => {
      await authService.init();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setRememberedEmail(authService.getRememberedEmail());
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string, rememberMe = false): Promise<void> => {
    const authedUser = await authService.login(email, pass, rememberMe);
    setUser(authedUser);
    if (rememberMe) {
      setRememberedEmail(email);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (updates: { name: string; role: string }): void => {
    if (!user) return;
    const updated = authService.updateProfile(user.id, updates);
    setUser(updated);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    await authService.changePassword(user.id, oldPass, newPass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        rememberedEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
