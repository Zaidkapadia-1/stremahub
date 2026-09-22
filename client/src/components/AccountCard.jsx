import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bell, ChevronRight, CheckCircle2, Tv } from 'lucide-react';
import ServiceLogo from './ServiceLogo';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import PingModal from './PingModal';

export default function AccountCard({ account, slots = [] }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useUser();

  const [pingModalOpen, setPingModalOpen] = useState(false);
  const [claimingSlot, setClaimingSlot] = useState(false);

  const totalSlots    = account.totalSlots || 2;
  const occupiedSlots = slots.filter((s) => s.memberId !== null);
  const occupiedCount = occupiedSlots.length;
  const isFull        = occupiedCount >= totalSlots;
  const hasAvailable  = occupiedCount < totalSlots;

  // Check if current user occupies a slot in this account
  const myOccupiedSlot = slots.find((s) => s.memberId && s.memberId === user?.memberId);

  const goToDetail = () => {
    navigate(`/group/${groupId}/account/${account._id}`);
  };

  const handleClaim = (e) => {
    e.stopPropagation();
    if (!socket || claimingSlot) return;
    setClaimingSlot(true);
    socket.emit('claim_slot', { accountId: account._id });
    setTimeout(() => setClaimingSlot(false), 800);
  };

  const handleRelease = (e, slotNumber) => {
    e.stopPropagation();
    if (!socket) return;
    socket.emit('release_slot', { accountId: account._id, slotNumber });
  };

  const handlePing = (e) => {
    e.stopPropagation();
    setPingModalOpen(true);
  };

  return (
    <>
      <div
        className={`account-card ${isFull ? 'account-card--full' : hasAvailable ? 'account-card--available' : ''}`}
        style={{
          background: 'var(--bg-card, #121422)',
          border: isFull
            ? '1px solid rgba(239,68,68,0.22)'
            : hasAvailable
            ? '1px solid rgba(52,211,153,0.22)'
            : '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.18s ease',
          boxShadow: isFull
            ? '0 4px 20px rgba(239,68,68,0.05)'
            : hasAvailable
            ? '0 4px 20px rgba(52,211,153,0.05)'
            : 'none'
        }}
      >
        {/* Header: Service Identity + Availability status */}
        <div
          onClick={goToDetail}
          style={{
            padding: '16px 18px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ServiceLogo name={account.serviceName} size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC' }}>
                  {account.serviceName}
                </h3>
                <ChevronRight size={14} color="var(--text-muted, #64748B)" />
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94A3B8)', fontWeight: 600 }}>
                {occupiedCount} / {totalSlots} active
              </span>
            </div>
          </div>

          {/* Status badge */}
          {isFull ? (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(239,68,68,0.12)',
              color: '#F87171',
              border: '1px solid rgba(239,68,68,0.24)',
              letterSpacing: '0.02em'
            }}>
              All full
            </span>
          ) : (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(52,211,153,0.12)',
              color: '#34D399',
              border: '1px solid rgba(52,211,153,0.24)',
              letterSpacing: '0.02em'
            }}>
              Available
            </span>
          )}
        </div>

        {/* Slot rows: Immediate availability + Action next to slot state */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const slotNumber = idx + 1;
            const slot = slots.find((s) => s.slotNumber === slotNumber);
            const isOccupied = slot && slot.memberId !== null;
            const isMine = isOccupied && slot.memberId === user?.memberId;

            return (
              <div
                key={slotNumber}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: isMine
                    ? 'rgba(139,92,246,0.12)'
                    : isOccupied
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(52,211,153,0.05)',
                  border: isMine
                    ? '1px solid rgba(139,92,246,0.3)'
                    : isOccupied
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(52,211,153,0.16)',
                  fontSize: '0.84rem'
                }}
              >
                {/* Slot state indicator + user info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOccupied ? '#10B981' : 'transparent',
                    border: isOccupied ? 'none' : '1.5px solid #34D399',
                    flexShrink: 0
                  }} />

                  <span style={{
                    fontWeight: isOccupied ? 700 : 500,
                    color: isOccupied ? '#F8FAFC' : '#34D399',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {isOccupied ? (isMine ? `${slot.memberName} (You)` : slot.memberName) : 'Available'}
                  </span>

                  {isOccupied && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(16,185,129,0.14)',
                      color: '#10B981',
                      flexShrink: 0
                    }}>
                      Watching
                    </span>
                  )}
                </div>

                {/* Inline Action close to slot state */}
                <div>
                  {isMine ? (
                    <button
                      type="button"
                      onClick={(e) => handleRelease(e, slotNumber)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#F87171',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Release
                    </button>
                  ) : !isOccupied && !myOccupiedSlot ? (
                    <button
                      type="button"
                      disabled={claimingSlot}
                      onClick={handleClaim}
                      className="btn-primary"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    >
                      {claimingSlot ? 'Claiming…' : 'Claim Slot'}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Full card ping action or my release action */}
        {isFull && (
          <div style={{ padding: '0 18px 14px' }}>
            <button
              type="button"
              onClick={handlePing}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#FCA5A5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Bell size={13} />
              <span>Ping Viewer</span>
            </button>
          </div>
        )}
      </div>

      {/* Ping modal if opened */}
      <PingModal
        isOpen={pingModalOpen}
        onClose={() => setPingModalOpen(false)}
        account={account}
        slots={slots}
        targetUser="Everyone"
      />
    </>
  );
}
