import React from 'react';
import { X, Trash2 } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { AnalysisCard } from './AnalysisCard';

interface HistoryModalProps {
  item: AnalysisResult | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ item, onClose, onDelete }) => {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
              Analysis Inspection #{item.id.slice(-8)}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scan recorded on {new Date(item.timestamp).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onDelete && (
              <button
                className="btn-outline"
                style={{ padding: '0.4rem', borderRadius: '6px', color: '#f87171' }}
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                title="Delete this record"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              className="btn-outline"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <AnalysisCard result={item} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
