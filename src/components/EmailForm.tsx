import React, { useState } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Mail,
  FileText,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { SAMPLE_EMAILS } from '../data/sampleEmails';
import type { SampleEmail } from '../data/sampleEmails';
import type { EmailAnalysisInput } from '../types';

interface EmailFormProps {
  onAnalyze: (input: EmailAnalysisInput) => void;
  isLoading: boolean;
}

export const EmailForm: React.FC<EmailFormProps> = ({ onAnalyze, isLoading }) => {
  const [mode, setMode] = useState<'raw' | 'structured'>('raw');
  const [rawText, setRawText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSelectSample = (sample: SampleEmail) => {
    setMode('structured');
    setSender(sample.sender);
    setSubject(sample.subject);
    setBody(sample.body);
    setRawText(`From: ${sample.sender}\nSubject: ${sample.subject}\n\n${sample.body}`);
    setValidationError('');
  };

  const handleReset = () => {
    setRawText('');
    setSender('');
    setSubject('');
    setBody('');
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (mode === 'raw') {
      if (!rawText.trim()) {
        setValidationError('Please paste an email message or raw email content to analyze.');
        return;
      }
      onAnalyze({
        rawContent: rawText.trim(),
        body: rawText.trim()
      });
    } else {
      if (!body.trim()) {
        setValidationError('Please enter the email body content to analyze.');
        return;
      }
      onAnalyze({
        sender: sender.trim() || undefined,
        subject: subject.trim() || undefined,
        body: body.trim()
      });
    }
  };

  return (
    <div className="card" id="email-detector-section" style={{ marginBottom: '2rem' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="card-title-group">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="card-title">Email Threat Inspector</h2>
            <p className="card-subtitle">Scan incoming emails for phishing vectors, credential harvesting, and deceptive payloads</p>
          </div>
        </div>

        {/* Input Format Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'raw' ? 'var(--brand-primary)' : 'transparent',
              color: mode === 'raw' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => setMode('raw')}
          >
            Raw Email Paste
          </button>
          <button
            type="button"
            className="btn"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'structured' ? 'var(--brand-primary)' : 'transparent',
              color: mode === 'structured' ? '#fff' : 'var(--text-secondary)'
            }}
            onClick={() => setMode('structured')}
          >
            Detailed Fields
          </button>
        </div>
      </div>

      {/* Quick Test Samples Selector */}
      <div style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-accent)', fontSize: '0.82rem', fontWeight: 600, marginRight: '0.35rem' }}>
          <Sparkles size={16} />
          <span>Quick Test Samples:</span>
        </div>

        {SAMPLE_EMAILS.map(sample => (
          <button
            key={sample.id}
            type="button"
            className="sample-pill"
            onClick={() => handleSelectSample(sample)}
            title={`Load ${sample.name}`}
          >
            {sample.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {validationError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {mode === 'raw' ? (
          <div className="form-group">
            <label className="form-label" htmlFor="raw-email-textarea">
              <span>Paste Raw Email Content <span style={{ color: '#ef4444' }}>*</span></span>
              <span className="form-label-optional">Paste full message or headers (From, Subject, Body)</span>
            </label>
            <textarea
              id="raw-email-textarea"
              className="form-textarea"
              rows={8}
              placeholder="Paste raw email message with headers or plain body here...
Example:
From: Security Center <verify@paypa1-secure.xyz>
Subject: Urgent: Account Locked
Body: Click here to verify your password immediately..."
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={isLoading}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="sender-input">
                  <span>Sender Email / Name</span>
                  <span className="form-label-optional">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="sender-input"
                    type="text"
                    placeholder="e.g. security-team@paypal-support.com"
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject-input">
                  <span>Subject Line</span>
                  <span className="form-label-optional">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="subject-input"
                    type="text"
                    placeholder="e.g. Action Required: Verification Needed"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="body-textarea">
                <span>Email Body Content <span style={{ color: '#ef4444' }}>*</span></span>
                <span className="form-label-optional">Required</span>
              </label>
              <div className="input-with-icon" style={{ alignItems: 'flex-start' }}>
                <FileText size={16} className="input-icon" style={{ marginTop: '0.85rem' }} />
                <textarea
                  id="body-textarea"
                  className="form-textarea"
                  style={{ paddingLeft: '2.5rem' }}
                  rows={6}
                  placeholder="Paste or write the email body content to evaluate..."
                  value={body}
                  onChange={e => {
                    setBody(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleReset}
            disabled={isLoading || (!rawText && !body && !sender && !subject)}
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ minWidth: '170px' }}
          >
            {isLoading ? (
              <>
                <span className="pulsing-dot" style={{ backgroundColor: '#fff' }} />
                <span>Scanning Email...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Analyze Email</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
