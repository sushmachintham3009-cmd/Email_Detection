import React, { useState } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  ScanEye,
  History,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    onNavigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleLinkClick('/dashboard')}>
            <div className="nav-brand-logo">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                EmailGuard
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
                ENTERPRISE DEFENSE
              </div>
            </div>
          </div>

          <button
            className="mobile-nav-toggle"
            onClick={onCloseMobile}
            style={{ display: mobileOpen ? 'block' : 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button
              className={`sidebar-link ${currentPath === '/dashboard' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => handleLinkClick('/dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </li>

          <li className="sidebar-item">
            <button
              className={`sidebar-link ${currentPath === '/dashboard#detector' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                handleLinkClick('/dashboard');
                const el = document.getElementById('email-detector-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ScanEye size={18} />
              <span>Email Detector</span>
            </button>
          </li>

          <li className="sidebar-item">
            <button
              className={`sidebar-link ${currentPath === '/history' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => handleLinkClick('/history')}
            >
              <History size={18} />
              <span>Detection History</span>
            </button>
          </li>

          <li className="sidebar-item">
            <button
              className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => handleLinkClick('/settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of EmailGuard"
        message="Are you sure you want to end your current session? You will need your credentials to log back into the security portal."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
