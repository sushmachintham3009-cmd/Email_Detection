import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { storageService } from './services/storageService';

// Main Router and Layout Component
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Route state: '/login' | '/dashboard' | '/history' | '/settings'
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    if (['/dashboard', '/history', '/settings', '/login'].includes(path)) {
      return path;
    }
    return '/login';
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply saved theme on boot
  useEffect(() => {
    const settings = storageService.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (['/dashboard', '/history', '/settings', '/login'].includes(path)) {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate helper with history pushState
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleThemeChange = (theme: 'cyber-dark' | 'light-slate' | 'enterprise-blue') => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Route protection guard
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && currentPath !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && currentPath === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, currentPath]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="pulsing-dot" style={{ width: '16px', height: '16px', backgroundColor: 'var(--brand-primary)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Initializing Security Subsystems...</span>
      </div>
    );
  }

  // Unauthenticated Route: /login
  if (!isAuthenticated || currentPath === '/login') {
    return (
      <>
        <LoginPage onLoginSuccess={() => navigate('/dashboard')} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Protected App Shell: Dashboard, History, Settings
  const getPageTitle = () => {
    switch (currentPath) {
      case '/dashboard':
        return 'Email Security Dashboard';
      case '/history':
        return 'Detection Audit History';
      case '/settings':
        return 'Account & Engine Settings';
      default:
        return 'Email Security Dashboard';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          title={getPageTitle()}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          onNavigate={navigate}
        />

        <main>
          {currentPath === '/dashboard' && (
            <DashboardPage onNavigate={navigate} onShowToast={showToast} />
          )}
          {currentPath === '/history' && (
            <HistoryPage onShowToast={showToast} />
          )}
          {currentPath === '/settings' && (
            <SettingsPage onShowToast={showToast} onThemeChange={handleThemeChange} />
          )}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
