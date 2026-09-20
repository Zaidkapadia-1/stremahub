import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog — inline confirmation dialog (replaces window.confirm)
 * @param {boolean} isOpen
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel
 * @param {string} cancelLabel
 * @param {'danger'|'warning'|'default'} variant
 * @param {boolean} loading
 * @param {() => void} onConfirm
 * @param {() => void} onCancel
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const colorMap = {
    danger:  { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', btn: '#ef4444', icon: '#ef4444' },
    warning: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', btn: '#f59e0b', icon: '#fbbf24' },
    default: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', btn: '#8b5cf6', icon: '#c084fc' },
  };
  const colors = colorMap[variant] || colorMap.default;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: colors.bg, border: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <AlertTriangle size={22} color={colors.icon} />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{title}</h2>
        </div>

        {message && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ padding: '9px 20px', fontSize: '0.88rem' }}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 20px', fontSize: '0.88rem',
              background: colors.btn,
              color: '#fff', border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
