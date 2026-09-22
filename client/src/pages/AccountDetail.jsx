import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Clock, Zap, Lock, Activity } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import PingModal from '../components/PingModal';
import Sidebar from '../components/Sidebar';
import ServiceLogo, { getServiceColor } from '../components/ServiceLogo';

/* ─── Helpers ─────────────────────────────────────────── */
const avatarBg = (name = '') => {
  const palette = ['#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  return palette[name.charCodeAt(0) % palette.length];
};

const timeAgo = (date) => {
  if (!date) return null;
  const m = Math.round((Date.now() - new Date(date)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
};

const relativeTime = (date) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (minutes < 1)    return 'Just now';
  if (minutes < 60)   return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

const EVENT_COLORS = {
  slot_claimed:  { bg: 'rgba(168,85,247,0.14)', color: '#c084fc' },
  slot_released: { bg: 'rgba(249,115,22,0.14)', color: '#f97316' },
  slot_pinged:   { bg: 'rgba(248,113,113,0.14)', color: '#f87171' },
  member_joined: { bg: 'rgba(16,185,129,0.14)', color: '#10b981' },
  account_added: { bg: 'rgba(96,165,250,0.14)', color: '#60a5fa' },
};

export default function AccountDetail() {
  const { groupId, accountId } = useParams();
  const navigate = useNavigate();
  const { user }   = useUser();
  const { socket, slotsByAccount = {}, requestSlotsSync } = useSocket();

  const [account,       setAccount]       = useState(null);
  const [group,         setGroup]         = useState(null);
  const [members,       setMembers]       = useState([]);
  const [activities,    setActivities]    = useState([]);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingedUser,    setPingedUser]    = useState('Everyone');
  const [notice,        setNotice]        = useState('');
  const [claiming,      setClaiming]      = useState(false);

  // Consume slots directly from shared SocketContext
  const slots = slotsByAccount[accountId] || [];

  /* Load group/account data + recent activity */
  useEffect(() => {
    Promise.all([
      api.get(`/group/${groupId}`),
      api.get(`/group/${groupId}/activity`).catch(() => ({ data: { activities: [] } })),
    ]).then(([groupRes, actRes]) => {
      const found = groupRes.data.accounts?.find((a) => a._id === accountId);
      if (found) setAccount(found);
      setGroup(groupRes.data.group);
      setMembers(groupRes.data.members || []);
      // Filter activity to this account
      const all = actRes.data.activities || [];
      setActivities(all.filter((a) => a.detail?.includes(found?.serviceName || 'zzz')).slice(0, 8));
    }).catch(console.error);
  }, [groupId, accountId]);

  // Request sync on mount to ensure fresh state
  useEffect(() => {
    if (requestSlotsSync) {
      requestSlotsSync();
    }
  }, [requestSlotsSync]);

  // Listen for socket errors or slot update completion
  useEffect(() => {
    if (!socket) return;
    const onError = ({ message }) => {
      setClaiming(false);
      setNotice(message || '');
      setTimeout(() => setNotice(''), 4000);
    };
    const onSlotUpdate = (data) => {
      if (data.accountId === accountId) {
        setClaiming(false);
      }
    };

    socket.on('error_event', onError);
    socket.on('slot_updated', onSlotUpdate);
    return () => {
      socket.off('error_event', onError);
      socket.off('slot_updated', onSlotUpdate);
    };
  }, [socket, accountId]);

  /* Derived values */
  const totalSlots    = account?.totalSlots || 2;
  const occupiedSlots = slots.filter((s) => s.memberId !== null);
  const myMemberId    = user?.memberId ? String(user.memberId) : null;
  const mySlot        = slots.find((s) => s.memberId && String(s.memberId) === myMemberId);
  const isFull        = occupiedSlots.length >= totalSlots;
  const fillPct       = totalSlots > 0 ? Math.round((occupiedSlots.length / totalSlots) * 100) : 0;
  const svcColor      = getServiceColor(account?.serviceName || '');

  /* Handlers — unchanged from original */
  const handleClaimSlot = () => {
    if (!socket || claiming) return;
    setClaiming(true);
    socket.emit('claim_slot', { accountId });
  };
  const handleReleaseSlot = (slotNumber) => {
    setNotice('');
    socket?.emit('release_slot', { accountId, slotNumber });
  };
  const handlePingAll = () => {
    if (!socket) return;
    occupiedSlots.forEach((s) => socket.emit('nudge_slot', { accountId, slotNumber: s.slotNumber }));
    const other = occupiedSlots.find((s) => String(s.memberId) !== myMemberId);
    setPingedUser(other?.memberName || 'Everyone');
    setShowPingModal(true);
  };

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={group?.name} />

      <main className="main-content" style={{ padding: '28px 36px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="btn-icon"
          style={{ gap: '4px', color: 'var(--text-secondary)', marginBottom: '24px', paddingLeft: 0 }}
        >
          <ChevronLeft size={18} />
          <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Back to Dashboard</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px', alignItems: 'start' }}>

          {/* ════ LEFT ══════════════════════════════════════════ */}
          <div>
            {/* Service hero */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              background: `linear-gradient(135deg, ${svcColor}1A 0%, transparent 55%), var(--bg-card)`,
              border: `1px solid ${svcColor}44`,
              padding: '22px 24px 20px',
              marginBottom: '16px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: '-50px', right: '-50px',
                width: '180px', height: '180px', borderRadius: '50%',
                background: `radial-gradient(circle, ${svcColor}28, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <ServiceLogo name={account?.serviceName || ''} size={52} />
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {account?.serviceName || 'Streaming Service'}
                  </h1>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Shared group account
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { label: `${totalSlots} total slots`,                   bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
                  { label: `${occupiedSlots.length} in use`,               bg: isFull ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)', color: isFull ? '#f87171' : '#10b981' },
                  { label: `${totalSlots - occupiedSlots.length} free`,    bg: 'rgba(168,85,247,0.1)', color: '#c084fc' },
                ].map((p) => (
                  <span key={p.label} style={{
                    background: p.bg, color: p.color,
                    borderRadius: 'var(--radius-full)', padding: '4px 12px',
                    fontSize: '0.76rem', fontWeight: 700,
                  }}>
                    {p.label}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${fillPct}%`,
                  background: isFull ? 'linear-gradient(90deg,#f87171,#ef4444)' : `linear-gradient(90deg,${svcColor},${svcColor}99)`,
                  borderRadius: '3px', transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Slot cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {Array.from({ length: totalSlots }).map((_, idx) => {
                const slotNumber = idx + 1;
                const slot       = slots.find((s) => s.slotNumber === slotNumber);
                const isOccupied = slot && slot.memberId !== null;
                const isMe       = isOccupied && myMemberId && String(slot.memberId) === myMemberId;
                const bg         = isOccupied ? avatarBg(slot.memberName || '') : '#1e2233';

                return (
                  <div
                    key={slotNumber}
                    className={`adetail__slot-card ${isMe ? 'adetail__slot-card--me' : isOccupied ? 'adetail__slot-card--occupied' : 'adetail__slot-card--empty'}`}
                  >
                    {/* Slot number */}
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)',
                    }}>
                      {slotNumber}
                    </div>

                    {/* Avatar */}
                    {isOccupied ? (
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem', color: '#fff',
                        boxShadow: `0 0 10px ${bg}55`,
                      }}>
                        {(slot.memberName || 'U').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        border: '1.5px dashed var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)',
                      }}>
                        <Lock size={13} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem', fontWeight: 700,
                        color: isOccupied ? 'var(--text-primary)' : 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {isOccupied ? `${slot.memberName}${isMe ? ' (You)' : ''}` : 'Available'}
                      </div>
                      {isOccupied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <div className="online-dot" style={{ width: '6px', height: '6px' }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--status-watching)', fontWeight: 600 }}>Watching</span>
                          {slot.claimedAt && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {timeAgo(slot.claimedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>No one watching</div>
                      )}
                    </div>

                    {/* Release — own slot only */}
                    {isMe && (
                      <button
                        onClick={() => handleReleaseSlot(slotNumber)}
                        className="btn-secondary"
                        style={{ padding: '6px 16px', fontSize: '0.78rem', flexShrink: 0 }}
                      >
                        Release
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Primary CTA */}
            {!mySlot && !isFull && (
              <button
                onClick={handleClaimSlot}
                disabled={claiming}
                className="btn-primary"
                style={{ padding: '12px 32px', fontSize: '0.94rem', minWidth: '200px' }}
              >
                {claiming ? '⏳ Claiming…' : <><Zap size={16} fill="currentColor" /> Claim a Slot</>}
              </button>
            )}

            {!mySlot && isFull && (
              <button
                onClick={handlePingAll}
                className="btn-primary"
                style={{
                  padding: '12px 32px', fontSize: '0.94rem', minWidth: '200px',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  boxShadow: '0 4px 18px rgba(239,68,68,0.35)',
                }}
              >
                <Bell size={16} /> Ping Everyone
              </button>
            )}

            {/* Error notice */}
            {notice && (
              <div style={{
                marginTop: '12px', padding: '10px 16px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: '#f87171',
              }}>
                {notice}
              </div>
            )}
          </div>

          {/* ════ RIGHT — Account Activity Panel ═════════════════ */}
          <div className="adetail__activity-panel">
            <p className="adetail__activity-title">Account Activity</p>

            {activities.length === 0 ? (
              <p className="adetail__activity-empty">
                Claims, releases and pings for this account will appear here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {activities.map((item) => {
                  const ec = EVENT_COLORS[item.type] || { bg: 'rgba(168,85,247,0.14)', color: '#c084fc' };
                  return (
                    <div
                      key={item._id}
                      style={{
                        display: 'flex', gap: '12px', padding: '11px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                        background: ec.bg, color: ec.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Activity size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                          <strong>{item.actorName}</strong>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{item.detail}</span>
                        </p>
                        <time style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {relativeTime(item.createdAt)}
                        </time>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <PingModal
          isOpen={showPingModal}
          onClose={() => setShowPingModal(false)}
          targetUser={pingedUser}
          targetSlot={occupiedSlots[0]}
        />
      </main>
    </div>
  );
}