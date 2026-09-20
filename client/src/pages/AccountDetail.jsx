import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Clock, Zap, Lock } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import PingModal from '../components/PingModal';
import Sidebar from '../components/Sidebar';
import ServiceLogo, { getServiceColor } from '../components/ServiceLogo';

/* ─── Avatar colour from name ──────────────────────────── */
const avatarBg = (name = '') => {
  const palette = ['#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  return palette[name.charCodeAt(0) % palette.length];
};

/* ─── Relative time ────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return null;
  const m = Math.round((Date.now() - new Date(date)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
};

export default function AccountDetail() {
  const { groupId, accountId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket } = useSocket();

  const [account, setAccount] = useState(null);
  const [slots, setSlots] = useState([]);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingedUser, setPingedUser] = useState('Everyone');
  const [notice, setNotice] = useState('');
  const [claiming, setClaiming] = useState(false);

  /* Load group/account data */
  useEffect(() => {
    api.get(`/group/${groupId}`)
      .then((res) => {
        const found = res.data.accounts?.find((a) => a._id === accountId);
        if (found) setAccount(found);
        setGroup(res.data.group);
        setMembers(res.data.members || []);
      })
      .catch(console.error);
  }, [groupId, accountId]);

  /* Socket: subscribe to slot events + force-resync on mount */
  useEffect(() => {
    if (!socket) return;

    // ✅ KEY FIX: re-emit join_group_room so server pushes slots_synced
    // This handles the case where socket was already connected before
    // this page mounted, so we never received the initial slots_synced.
    if (socket.connected) {
      socket.emit('join_group_room');
    } else {
      socket.once('connect', () => socket.emit('join_group_room'));
    }

    const onSlotUpdate = (data) => {
      if (data.accountId === accountId) { setSlots(data.slots || []); setClaiming(false); }
    };
    const onSlotsSynced = (all) => {
      const cur = all.find((x) => x.accountId === accountId);
      if (cur) setSlots(cur.slots || []);
    };
    const onError = ({ message }) => {
      setClaiming(false);
      setNotice(message || '');
      setTimeout(() => setNotice(''), 4000);
    };

    socket.on('slot_updated', onSlotUpdate);
    socket.on('slots_synced', onSlotsSynced);
    socket.on('error_event', onError);
    return () => {
      socket.off('slot_updated', onSlotUpdate);
      socket.off('slots_synced', onSlotsSynced);
      socket.off('error_event', onError);
    };
  }, [socket, accountId]);

  const totalSlots    = account?.totalSlots || 2;
  const occupiedSlots = slots.filter((s) => s.memberId !== null);
  const myMemberId    = user?.memberId ? String(user.memberId) : null;
  const mySlot        = slots.find((s) => s.memberId && String(s.memberId) === myMemberId);
  const isFull        = occupiedSlots.length >= totalSlots;
  const fillPct       = totalSlots > 0 ? Math.round((occupiedSlots.length / totalSlots) * 100) : 0;
  const svcColor      = getServiceColor(account?.serviceName || '');

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

      <main className="main-content" style={{ padding: '32px 40px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="btn-icon"
          style={{ gap: '4px', color: 'var(--text-secondary)', marginBottom: '28px', paddingLeft: 0 }}
        >
          <ChevronLeft size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Back to Dashboard</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* ════ LEFT ══════════════════════════════════════════ */}
          <div>

            {/* ── Service hero card ──────────────────────────── */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              background: `linear-gradient(135deg, ${svcColor}1A 0%, transparent 55%), var(--bg-card)`,
              border: `1px solid ${svcColor}44`,
              padding: '24px 24px 20px',
              marginBottom: '18px',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Glow orb */}
              <div style={{
                position: 'absolute', top: '-50px', right: '-50px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: `radial-gradient(circle, ${svcColor}28, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <ServiceLogo name={account?.serviceName || ''} size={56} />
                <div>
                  <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {account?.serviceName || 'Streaming Service'}
                  </h1>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Shared group account
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {[
                  { label: `${totalSlots} total slots`,                bg: 'rgba(96,165,250,0.1)',   color: '#60a5fa' },
                  { label: `${occupiedSlots.length} in use`,           bg: isFull ? 'rgba(248,113,113,0.1)' : 'rgba(16,185,129,0.1)', color: isFull ? '#f87171' : '#10b981' },
                  { label: `${totalSlots - occupiedSlots.length} free`, bg: 'rgba(168,85,247,0.1)',  color: '#c084fc' },
                ].map((p) => (
                  <span key={p.label} style={{
                    background: p.bg, color: p.color,
                    borderRadius: 'var(--radius-full)', padding: '5px 13px',
                    fontSize: '0.78rem', fontWeight: 700
                  }}>
                    {p.label}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>SLOT USAGE</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>{fillPct}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${fillPct}%`,
                    background: isFull ? 'linear-gradient(90deg,#f87171,#ef4444)' : `linear-gradient(90deg,${svcColor},${svcColor}99)`,
                    borderRadius: '3px', transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* ── Slot Cards ──────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {Array.from({ length: totalSlots }).map((_, idx) => {
                const slotNumber = idx + 1;
                const slot       = slots.find((s) => s.slotNumber === slotNumber);
                const isOccupied = slot && slot.memberId !== null;
                const isMe       = isOccupied && myMemberId && String(slot.memberId) === myMemberId;
                const bg         = isOccupied ? avatarBg(slot.memberName || '') : '#1e2233';

                return (
                  <div
                    key={slotNumber}
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg,rgba(16,185,129,0.09),rgba(16,185,129,0.03))'
                        : isOccupied
                          ? 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(139,92,246,0.02))'
                          : 'var(--bg-card)',
                      border: isMe
                        ? '1px solid rgba(16,185,129,0.4)'
                        : isOccupied
                          ? '1px solid rgba(139,92,246,0.3)'
                          : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'all 0.2s',
                      boxShadow: isMe ? '0 2px 14px rgba(16,185,129,0.1)' : 'none'
                    }}
                  >
                    {/* Number badge */}
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '7px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0
                    }}>
                      {slotNumber}
                    </div>

                    {/* Avatar */}
                    {isOccupied ? (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.95rem', color: '#fff',
                        boxShadow: `0 0 10px ${bg}55`
                      }}>
                        {(slot.memberName || 'U').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        border: '1.5px dashed var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}>
                        <Lock size={14} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.93rem', fontWeight: 700,
                        color: isOccupied ? 'var(--text-primary)' : 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {isOccupied ? `${slot.memberName}${isMe ? ' (You)' : ''}` : 'Available'}
                      </div>
                      {isOccupied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <div className="online-dot" style={{ width: '6px', height: '6px' }} />
                          <span style={{ fontSize: '0.74rem', color: 'var(--status-watching)', fontWeight: 600 }}>Watching</span>
                          {slot.claimedAt && (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {timeAgo(slot.claimedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>No one watching</div>
                      )}
                    </div>

                    {/* Release button — only for own slot */}
                    {isMe && (
                      <button
                        onClick={() => handleReleaseSlot(slotNumber)}
                        className="btn-secondary"
                        style={{ padding: '7px 18px', fontSize: '0.8rem', flexShrink: 0 }}
                      >
                        Release
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── CTA ─────────────────────────────────────────── */}
            {!mySlot && !isFull && (
              <button
                onClick={handleClaimSlot}
                disabled={claiming}
                className="btn-primary"
                style={{ padding: '13px 32px', fontSize: '0.95rem', minWidth: '200px' }}
              >
                {claiming ? '⏳ Claiming…' : <><Zap size={16} fill="currentColor" /> Claim a Slot</>}
              </button>
            )}

            {!mySlot && isFull && (
              <button onClick={handlePingAll} className="btn-primary" style={{
                padding: '13px 32px', fontSize: '0.95rem', minWidth: '200px',
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                boxShadow: '0 4px 18px rgba(239,68,68,0.35)'
              }}>
                <Bell size={16} /> Ping Everyone
              </button>
            )}

            {/* Error / notice */}
            {notice && (
              <div style={{
                marginTop: '14px', padding: '10px 16px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: '#f87171'
              }}>
                {notice}
              </div>
            )}
          </div>

          {/* ════ RIGHT ══════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Artwork panel */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              background: `radial-gradient(ellipse at 50% 20%, ${svcColor}28, transparent 65%), #0f1120`,
              border: `1px solid ${svcColor}33`,
              padding: '36px 24px', textAlign: 'center',
              minHeight: '240px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '18px',
              position: 'relative', overflow: 'hidden'
            }}>
              <ServiceLogo name={account?.serviceName || ''} size={80} />
              <div className="doodle-text" style={{ fontSize: '1.4rem', transform: 'rotate(-3deg)', lineHeight: 1.3 }}>
                Even Legends<br />Share Accounts ♡
              </div>
              {/* Slot count pill */}
              <div style={{
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-full)', padding: '5px 14px',
                fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)'
              }}>
                {occupiedSlots.length} / {totalSlots} slots occupied
              </div>
            </div>

            {/* How it works */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '20px'
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                HOW IT WORKS
              </p>
              {[
                { icon: '⚡', title: 'Claim',   desc: 'Grab an available slot to start watching' },
                { icon: '🔔', title: 'Ping',    desc: 'All slots full? Request one from others' },
                { icon: '✅', title: 'Release', desc: 'Done? Free up your slot for the group' },
              ].map((s) => (
                <div key={s.title} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem'
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                ⏱ Pinged slots auto-release after <strong style={{ color: 'var(--text-secondary)' }}>2 minutes</strong> if no response.
              </div>
            </div>
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