import React, { useState } from 'react';
import {
  Radar,
  ArrowRight,
  History,
  Sparkles
} from 'lucide-react';
import { EmailForm } from '../components/EmailForm';
import { AnalysisCard } from '../components/AnalysisCard';
import { StatsSection } from '../components/StatCard';
import { HistoryModal } from '../components/HistoryModal';
import { analyzeEmail } from '../services/detectionService';
import { storageService } from '../services/storageService';
import type { AnalysisResult, DashboardStats, EmailAnalysisInput } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onShowToast }) => {
  const [stats, setStats] = useState<DashboardStats>(() => storageService.getStats());
  const [recentScans, setRecentScans] = useState<AnalysisResult[]>(() => storageService.getHistory().slice(0, 5));
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisResult | null>(null);

  // Refresh stats and recent list
  const refreshData = () => {
    setStats(storageService.getStats());
    setRecentScans(storageService.getHistory().slice(0, 5));
  };

  const handleAnalyze = async (input: EmailAnalysisInput) => {
    setIsScanning(true);
    setCurrentResult(null);

    try {
      const result = await analyzeEmail(input);

      // Save to persistence
      const settings = storageService.getSettings();
      if (settings.autoSaveHistory) {
        storageService.saveAnalysis(result);
      }

      setCurrentResult(result);
      refreshData();

      // Show contextual toast based on classification
      if (result.classification === 'PHISHING') {
        onShowToast('Threat Detected: High-risk phishing payload identified!', 'error');
      } else if (result.classification === 'SAFE') {
        onShowToast('Scan Complete: Email verified as benign/safe.', 'success');
      } else if (result.classification === 'SPAM') {
        onShowToast('Scan Complete: Unsolicited promotional spam detected.', 'info');
      } else {
        onShowToast('Scan Complete: Suspicious indicators require user review.', 'info');
      }

      // Smooth scroll down to analysis results
      setTimeout(() => {
        const el = document.getElementById('latest-analysis-result');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      onShowToast('An error occurred during heuristic scan. Please try again.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = (classification: string) => {
    switch (classification) {
      case 'SAFE':
        return <span className="badge badge-safe">SAFE</span>;
      case 'PHISHING':
        return <span className="badge badge-phishing">PHISHING</span>;
      case 'SPAM':
        return <span className="badge badge-spam">SPAM</span>;
      default:
        return <span className="badge badge-suspicious">SUSPICIOUS</span>;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Overview Statistics Cards */}
      <StatsSection stats={stats} />

      {/* Main Email Input & Analyzer Form */}
      <EmailForm onAnalyze={handleAnalyze} isLoading={isScanning} />

      {/* Scanning Radar Loading State */}
      {isScanning && (
        <div className="scanning-container" style={{ marginBottom: '2rem' }}>
          <div className="scan-radar">
            <Radar size={42} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Deep Inspecting Email Artifacts...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Executing heuristic URL dissection, urgency pattern matching, and spoofing heuristics
            </p>
          </div>
          <div className="scan-progress-bar">
            <div className="scan-progress-fill" />
          </div>
        </div>
      )}

      {/* Prominent Current Analysis Result Display */}
      {currentResult && (
        <div id="latest-analysis-result">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--brand-accent)' }} />
              <span>Inspection Outcome</span>
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scan ID: {currentResult.id}
            </span>
          </div>

          <AnalysisCard result={currentResult} />
        </div>
      )}

      {/* Recent Detections Preview Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <History size={18} style={{ color: 'var(--brand-accent)' }} />
            <div>
              <h3 className="card-title">Recent Detections Feed</h3>
              <p className="card-subtitle">Real-time log of recently evaluated incoming messages</p>
            </div>
          </div>

          <button
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
            onClick={() => onNavigate('/history')}
          >
            <span>View All History</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <p>No detection history recorded yet.</p>
            <span style={{ fontSize: '0.82rem' }}>Analyze your first email above to begin tracking threats.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Verdict</th>
                  <th>Confidence</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {item.sender || 'Unknown'}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.subject || '(No subject)'}
                    </td>
                    <td>{getStatusBadge(item.classification)}</td>
                    <td style={{ fontWeight: 700 }}>
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedHistoryItem(item)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Item Modal */}
      <HistoryModal
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />
    </div>
  );
};
