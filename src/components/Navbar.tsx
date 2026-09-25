import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

interface NavbarProps {
  onToggleMobileNav: () => void;
  onNavigate: (path: string) => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileNav,
  onNavigate,
  title = 'Email Security Dashboard'
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    onNavigate('/login');
  };

  return (
    <>
      <header className="top-navbar">
        <div className="nav-left">
          <button
            className="btn-outline mobile-nav-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="nav-title-group">
            <h1>{title}</h1>
            <span className="nav-subtitle">Real-Time Threat Detection & Heuristic Phishing Prevention</span>
          </div>
        </div>

        <div className="nav-right">
          <div className="engine-status-pill">
            <span className="pulsing-dot" />
            <span>AI & Rule Engine Active</span>
          </div>

          <div className="user-menu-container" ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="user-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-email-text">{user?.email || 'security@emailguard.io'}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '230px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: '0.5rem',
                  zIndex: 60,
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user?.name || 'Security Analyst'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.35rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--brand-accent)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {user?.role || 'Analyst'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0.35rem 0' }}>
                  <button
                    className="sidebar-link"
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('/settings');
                    }}
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </button>

                  <button
                    className="sidebar-link"
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('/settings');
                    }}
                  >
                    <Settings size={15} />
                    <span>Security Settings</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

                  <button
                    className="sidebar-logout-btn"
                    style={{ width: '100%', border: 'none', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out of EmailGuard"
        message="Are you sure you want to end your session? You will be returned to the login screen."
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
