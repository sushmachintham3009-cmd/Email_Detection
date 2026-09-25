import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Trash2
} from 'lucide-react';
import { HistoryModal } from '../components/HistoryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { storageService } from '../services/storageService';
import type { AnalysisResult, Classification } from '../types';

interface HistoryPageProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onShowToast }) => {
  const [history, setHistory] = useState<AnalysisResult[]>(() => storageService.getHistory());
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<AnalysisResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadData = () => {
    setHistory(storageService.getHistory());
  };

  const handleDeleteItem = (id: string) => {
    storageService.deleteAnalysis(id);
    loadData();
    onShowToast('Analysis record deleted.', 'info');
  };

  const handleClearAll = () => {
    storageService.clearHistory();
    loadData();
    setShowClearConfirm(false);
    onShowToast('All detection history cleared.', 'info');
  };

  const handleExportCsv = () => {
    if (history.length === 0) {
      onShowToast('No history available to export.', 'info');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Sender', 'Subject', 'Classification', 'Confidence', 'RiskScore', 'Explanation'];
    const rows = history.map(item => [
      `"${item.id}"`,
      `"${item.timestamp}"`,
      `"${(item.sender || '').replace(/"/g, '""')}"`,
      `"${(item.subject || '').replace(/"/g, '""')}"`,
      `"${item.classification}"`,
      `"${Math.round(item.confidence * 100)}%"`,
      `"${item.score}"`,
      `"${(item.explanation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EmailGuard_Scan_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Exported scan history to CSV.', 'success');
  };

  // Filtered dataset
  const filtered = history.filter(item => {
    const matchesFilter = filterClassification === 'ALL' || item.classification === filterClassification;
    const matchesSearch = !searchQuery.trim() ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (classification: Classification) => {
    switch (classification) {
      case 'SAFE':
        return <span className="badge badge-safe">SAFE</span>;
      case 'PHISHING':
        return <span className="badge badge-phishing">PHISHING</span>;
      case 'SPAM':
        return <span className="badge badge-spam">SPAM</span>;
      case 'SUSPICIOUS':
        return <span className="badge badge-suspicious">SUSPICIOUS</span>;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Detection Audit Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Comprehensive historical archive of scanned emails, classification verdicts, and threat indicators
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleExportCsv} disabled={history.length === 0}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button
            className="btn btn-outline"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Classification Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(['ALL', 'PHISHING', 'SUSPICIOUS', 'SPAM', 'SAFE'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                className="btn"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-full)',
                  background: filterClassification === cat ? 'var(--brand-primary)' : 'var(--bg-input)',
                  color: filterClassification === cat ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
                onClick={() => setFilterClassification(cat)}
              >
                {cat === 'ALL' ? `All Records (${history.length})` : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="input-with-icon" style={{ minWidth: '280px', maxWidth: '380px', flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Search by sender or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* History Table Card */}
      <div className="card" style={{ padding: '0.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <History size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Matching Records Found
            </h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              {searchQuery || filterClassification !== 'ALL'
                ? 'Try adjusting your search criteria or classification filter.'
                : 'Scanned emails will be recorded here automatically.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Classification</th>
                  <th>Confidence</th>
                  <th>Indicators</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {item.sender || 'Unknown Sender'}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.subject || '(No subject)'}
                    </td>
                    <td>{getStatusBadge(item.classification)}</td>
                    <td style={{ fontWeight: 700 }}>
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.indicators.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: item.indicators.length > 0 ? '#f87171' : '#34d399',
                        fontWeight: 600
                      }}>
                        {item.indicators.length} detected
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => setSelectedItem(item)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn-outline"
                          style={{ padding: '0.35rem', borderRadius: '6px', color: '#f87171' }}
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <HistoryModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Detection History"
        message="This will permanently purge all stored email scan reports, indicators, and heuristic results. This action cannot be reversed."
        confirmLabel="Purge All Records"
        confirmVariant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
