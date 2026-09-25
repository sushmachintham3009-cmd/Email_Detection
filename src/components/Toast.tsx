import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--safe-solid)' }} />}
          {toast.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--phishing-solid)' }} />}
          {toast.type === 'info' && <Info size={18} style={{ color: 'var(--brand-primary)' }} />}

          <span style={{ flex: 1, fontSize: '0.88rem' }}>{toast.message}</span>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
