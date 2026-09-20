import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Plus } from 'lucide-react';

const serviceColors = {
  Netflix: { bg: '#E50914', text: '#fff' },
  'Prime Video': { bg: '#00A8E1', text: '#fff' },
  'Disney+': { bg: '#113CCF', text: '#fff' },
  'YouTube Premium': { bg: '#FF0000', text: '#fff' },
  'HBO Max': { bg: '#5822B4', text: '#fff' },
  'Apple TV+': { bg: '#222', text: '#fff' },
};

export default function AccountCard({ account, slots = [] }) {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const totalSlots = account.totalSlots || 2;
  const occupiedSlots = slots.filter((s) => s.memberId !== null);
  const occupiedCount = occupiedSlots.length;
  const isFull = occupiedCount >= totalSlots;
  const progressPercent = Math.min(100, Math.round((occupiedCount / totalSlots) * 100));

  const serviceStyle = serviceColors[account.serviceName] || { bg: '#ff5b48', text: '#fff' };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s, border-color 0.15s',
        position: 'relative'
      }}
      className="account-card"
    >
      {/* Decorative Card Top Cinematic Banner */}
      <div style={{
        height: '110px',
        background: `radial-gradient(circle at top right, rgba(255, 91, 72, 0.18), transparent 70%), linear-gradient(180deg, #181c2b 0%, #121520 100%)`,
        position: 'relative',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}>
        {/* Service Badge & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: serviceStyle.bg,
            color: serviceStyle.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            {account.serviceName.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{account.serviceName}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {occupiedCount}/{totalSlots} slots
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '5px',
          background: '#1f2434',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent-grad)',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Slot avatars row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 0',
          overflowX: 'auto'
        }}>
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const slot = slots.find((s) => s.slotNumber === idx + 1);
            const isOccupied = slot && slot.memberId !== null;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isOccupied ? '#252b3d' : 'transparent',
                  border: isOccupied ? '2px solid var(--accent-purple)' : '1px dashed var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isOccupied ? '#fff' : 'var(--text-muted)'
                }}>
                  {isOccupied ? (slot.memberName ? slot.memberName.charAt(0).toUpperCase() : 'U') : <Plus size={14} />}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  color: isOccupied ? '#fff' : 'var(--text-muted)',
                  fontWeight: 600,
                  maxWidth: '46px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {isOccupied ? slot.memberName : 'Empty'}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: isOccupied ? 'var(--status-watching)' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {isOccupied ? 'Watching' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
          {isFull ? (
            <button
              onClick={() => navigate(`/group/${groupId}/account/${account._id}`)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-full)',
                background: '#1A1E2B',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All slots in use
            </button>
          ) : (
            <button
              onClick={() => navigate(`/group/${groupId}/account/${account._id}`)}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '9px',
                fontSize: '0.85rem',
                gap: '6px'
              }}
            >
              <Play size={14} fill="currentColor" />
              <span>Watch Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
