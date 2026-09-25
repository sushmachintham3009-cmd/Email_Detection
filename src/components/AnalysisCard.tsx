import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  User,
  Mail,
  ListCheck,
  AlertOctagon
} from 'lucide-react';
import type { AnalysisResult, Classification } from '../types';

interface AnalysisCardProps {
  result: AnalysisResult;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const getBadgeClass = (c: Classification) => {
    switch (c) {
      case 'SAFE': return 'badge-safe';
      case 'SUSPICIOUS': return 'badge-suspicious';
      case 'SPAM': return 'badge-spam';
      case 'PHISHING': return 'badge-phishing';
    }
  };

  const getBannerClass = (c: Classification) => {
    switch (c) {
      case 'SAFE': return 'banner-safe';
      case 'SUSPICIOUS': return 'banner-suspicious';
      case 'SPAM': return 'banner-spam';
      case 'PHISHING': return 'banner-phishing';
    }
  };

  const getIcon = (c: Classification) => {
    switch (c) {
      case 'SAFE': return <ShieldCheck size={32} style={{ color: 'var(--safe-text)' }} />;
      case 'SUSPICIOUS': return <AlertTriangle size={32} style={{ color: 'var(--suspicious-text)' }} />;
      case 'SPAM': return <Flame size={32} style={{ color: 'var(--spam-text)' }} />;
      case 'PHISHING': return <ShieldAlert size={32} style={{ color: 'var(--phishing-text)' }} />;
    }
  };

  const formattedDate = new Date(result.timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid var(--border-strong)' }}>
      {/* Top Banner with Prominent Classification Color */}
      <div className={`analysis-header-banner ${getBannerClass(result.classification)}`}>
        <div className="analysis-status-group">
          <div className="classification-icon-box" style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            {getIcon(result.classification)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span className={`badge ${getBadgeClass(result.classification)}`} style={{ fontSize: '0.95rem', padding: '0.4rem 0.95rem' }}>
                {result.classification}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Risk Score: <strong>{result.score}/100</strong>
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {result.explanation}
            </div>
          </div>
        </div>

        {/* Confidence Percentage with Estimate Label */}
        <div className="confidence-gauge-box">
          <div className="confidence-number" style={{
            color: result.classification === 'SAFE' ? 'var(--safe-text)' :
                   result.classification === 'PHISHING' ? 'var(--phishing-text)' :
                   result.classification === 'SPAM' ? 'var(--spam-text)' : 'var(--suspicious-text)'
          }}>
            {Math.round(result.confidence * 100)}%
          </div>
          <div className="confidence-disclaimer">Confidence Estimate*</div>
        </div>
      </div>

      {/* Accuracy Disclaimer Note */}
      <div style={{
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        marginBottom: '1.5rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <AlertOctagon size={14} />
        <span>*Confidence scores represent probabilistic heuristic estimations and do not constitute a legal or 100% infallible security warranty. Always corroborate high-risk messages with standard organizational protocol.</span>
      </div>

      {/* Metadata Bar: Sender, Subject, Timestamp */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        padding: '1.15rem',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <User size={13} />
            <span>Sender</span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', marginTop: '0.2rem' }}>
            {result.sender || '(Not specified)'}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Mail size={13} />
            <span>Subject</span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', marginTop: '0.2rem' }}>
            {result.subject || '(No Subject)'}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Clock size={13} />
            <span>Analysis Timestamp</span>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Grid of Indicators & Findings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Warning Indicators */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--brand-accent)' }} />
            <span>Detected Warning Indicators ({result.indicators.length})</span>
          </h3>

          {result.indicators.length === 0 ? (
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--safe-text)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <CheckCircle2 size={18} />
              <span>No suspicious heuristics triggered. Clean communication pattern.</span>
            </div>
          ) : (
            <div className="indicator-list">
              {result.indicators.map((ind, i) => (
                <div key={ind.id || i} className="indicator-item">
                  <span className={`severity-pill sev-${ind.severity}`}>
                    {ind.severity}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {ind.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {ind.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heuristic Reasons & Recommendations */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <ListCheck size={16} style={{ color: 'var(--brand-accent)' }} />
            <span>Recommended Actions</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--brand-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {i + 1}
                </div>
                <span>{rec}</span>
              </div>
            ))}
          </div>

          {/* URLs Inspected (Sanitized, Untrusted Input) */}
          {result.urlsFound && result.urlsFound.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                Embedded URLs Inspected ({result.urlsFound.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {result.urlsFound.map((u, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: u.isSuspicious ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)',
                      border: `1px solid ${u.isSuspicious ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)'}`,
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      wordBreak: 'break-all'
                    }}
                  >
                    <span style={{ color: u.isSuspicious ? '#f87171' : 'var(--text-secondary)' }}>
                      [DEFANGED] {u.url.replace(/https?:\/\//, 'hxxp://')}
                    </span>
                    {u.reason && (
                      <div style={{ fontSize: '0.72rem', color: '#fb923c', marginTop: '0.2rem', fontFamily: 'var(--font-sans)' }}>
                        Warning: {u.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls: Copy Report / Toggle Raw Body */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          className="btn btn-outline"
          style={{ fontSize: '0.82rem' }}
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? 'Hide Raw Email Snippet' : 'View Sanitized Snippet'}
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem' }}
          onClick={handleCopyJson}
        >
          {copied ? <Check size={15} style={{ color: 'var(--safe-text)' }} /> : <Copy size={15} />}
          <span>{copied ? 'Copied Security JSON' : 'Export JSON Report'}</span>
        </button>
      </div>

      {showRaw && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Sanitized Input (Untrusted content safely contained):
          </div>
          <pre className="code-preview">
            {result.rawContent || result.bodySnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
