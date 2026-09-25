import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import type { UserSettings } from '../types';

interface SettingsPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onThemeChange: (theme: 'cyber-dark' | 'light-slate' | 'enterprise-blue') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onShowToast, onThemeChange }) => {
  const { user, updateProfile, changePassword } = useAuth();

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Security Analyst');

  // Change Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Profile Update
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Name cannot be empty.', 'error');
      return;
    }
    updateProfile({ name: name.trim(), role: role.trim() });
    onShowToast('Profile information updated successfully.', 'success');
  };

  // Handle Settings Save
  const handleSaveSettings = () => {
    storageService.saveSettings(settings);
    onThemeChange(settings.theme);
    onShowToast('Application preferences saved.', 'success');
  };

  // Handle Theme Change Preview
  const handleThemeSelect = (theme: 'cyber-dark' | 'light-slate' | 'enterprise-blue') => {
    setSettings(prev => ({ ...prev, theme }));
    onThemeChange(theme);
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPass) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPass.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPass, newPass);
      setPasswordSuccess('Password changed securely.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onShowToast('Account password updated.', 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Security & Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Configure user profile, encryption credentials, notification parameters, and scanner aesthetics
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Left Column: User Profile & Security Credentials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Profile Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <User size={18} style={{ color: 'var(--brand-accent)' }} />
                <div>
                  <h3 className="card-title">User Profile</h3>
                  <p className="card-subtitle">Manage administrative identity and role assignment</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Security Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="Lead Security Engineer">Lead Security Engineer</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="SOC Responder">SOC Responder</option>
                  <option value="IT Administrator">IT Administrator</option>
                  <option value="Compliance Auditor">Compliance Auditor</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <Lock size={18} style={{ color: 'var(--brand-accent)' }} />
                <div>
                  <h3 className="card-title">Change Password</h3>
                  <p className="card-subtitle">Salted SHA-256 local encrypted authentication key</p>
                </div>
              </div>
            </div>

            {passwordError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-password-toggle"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={passwordLoading || !currentPass || !newPass || !confirmPass}
                  style={{ fontSize: '0.88rem' }}
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Theme & Notifications & Sensitivity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Theme Preferences */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <Palette size={18} style={{ color: 'var(--brand-accent)' }} />
                <div>
                  <h3 className="card-title">Theme & Appearance</h3>
                  <p className="card-subtitle">Choose your preferred visual presentation style</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {[
                {
                  id: 'cyber-dark',
                  name: 'Cyber Dark (Default)',
                  desc: 'High-contrast dark navy palette with electric blue and emerald glows',
                  color: '#070d18'
                },
                {
                  id: 'enterprise-blue',
                  name: 'Enterprise Blue',
                  desc: 'Deep cobalt cybersecurity SaaS theme for security operations centers',
                  color: '#0a1128'
                },
                {
                  id: 'light-slate',
                  name: 'Light Slate',
                  desc: 'Clean corporate light theme with subtle borders and shadows',
                  color: '#f8fafc'
                }
              ].map(t => (
                <div
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${settings.theme === t.id ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {t.desc}
                    </div>
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: t.color,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {settings.theme === t.id && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Parameters & Notifications */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <Bell size={18} style={{ color: 'var(--brand-accent)' }} />
                <div>
                  <h3 className="card-title">Preferences & Sensitivity</h3>
                  <p className="card-subtitle">Tune heuristic thresholds and detection notifications</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Notification Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>High-Risk Phishing Alerts</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Display priority warning banner when malicious payloads are detected
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyPhishingAlerts}
                  onChange={e => setSettings(s => ({ ...s, notifyPhishingAlerts: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Auto-Record to Audit History</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Persist analyzed scans locally to detection log for future auditing
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveHistory}
                  onChange={e => setSettings(s => ({ ...s, autoSaveHistory: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Weekly Threat Intelligence Digest</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Synthesize aggregated spam and phishing trends
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyWeeklyDigest}
                  onChange={e => setSettings(s => ({ ...s, notifyWeeklyDigest: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Heuristic Sensitivity Level */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={14} style={{ color: 'var(--brand-accent)' }} />
                    <span>Detection Engine Sensitivity</span>
                  </span>
                </label>
                <select
                  value={settings.sensitivityLevel}
                  onChange={e => setSettings(s => ({ ...s, sensitivityLevel: e.target.value as any }))}
                >
                  <option value="conservative">Conservative (Minimal false positives, strict matching)</option>
                  <option value="balanced">Balanced (Recommended for corporate mailboxes)</option>
                  <option value="aggressive">Aggressive (Heightened inspection on all external links)</option>
                </select>
              </div>

              {/* Save Settings Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveSettings}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
