import React from 'react';
import { Mail, ShieldCheck, Flame, AlertOctagon } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatCardProps {
  stats: DashboardStats;
}

export const StatsSection: React.FC<StatCardProps> = ({ stats }) => {
  const safePercent = stats.totalAnalyzed > 0
    ? Math.round((stats.safeCount / stats.totalAnalyzed) * 100)
    : 0;

  const spamPercent = stats.totalAnalyzed > 0
    ? Math.round((stats.spamCount / stats.totalAnalyzed) * 100)
    : 0;

  const phishingPercent = stats.totalAnalyzed > 0
    ? Math.round((stats.phishingCount / stats.totalAnalyzed) * 100)
    : 0;

  return (
    <div className="stats-grid">
      {/* Total Analyzed */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-blue">
          <Mail size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Emails Analyzed</span>
          <span className="stat-value">{stats.totalAnalyzed}</span>
          <span className="stat-subtext">Avg Confidence: {stats.avgConfidence}%</span>
        </div>
      </div>

      {/* Safe Emails */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-green">
          <ShieldCheck size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Safe Emails</span>
          <span className="stat-value">{stats.safeCount}</span>
          <span className="stat-subtext" style={{ color: 'var(--safe-text)' }}>
            {safePercent}% of total scanned
          </span>
        </div>
      </div>

      {/* Spam Detected */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-orange">
          <Flame size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Spam Detected</span>
          <span className="stat-value">{stats.spamCount}</span>
          <span className="stat-subtext" style={{ color: 'var(--spam-text)' }}>
            {spamPercent}% promotional / bulk
          </span>
        </div>
      </div>

      {/* Phishing Detected */}
      <div className="stat-card">
        <div className="stat-icon-wrapper stat-icon-red">
          <AlertOctagon size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Phishing Detected</span>
          <span className="stat-value">{stats.phishingCount}</span>
          <span className="stat-subtext" style={{ color: 'var(--phishing-text)' }}>
            {phishingPercent}% malicious attempts
          </span>
        </div>
      </div>
    </div>
  );
};
