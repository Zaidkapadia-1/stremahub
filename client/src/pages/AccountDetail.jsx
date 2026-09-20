import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Info, Sliders, Clock } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import PingModal from '../components/PingModal';
import Sidebar from '../components/Sidebar';

const SERVICE_COLORS = {
  'Netflix':         '#E50914',
  'Prime Video':     '#00A8E1',
  'Disney+':         '#113CCF',
  'YouTube Premium': '#FF0000',
  'HBO Max':         '#5822B4',
  'Apple TV+':       '#2a2a2a',
};

const getServiceColor = (name) => SERVICE_COLORS[name] || '#7c3aed';

const timeAgo = (date) => {
  if (!date) return null;
  const minutes = Math.round((Date.now() - new Date(date)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
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

  useEffect(() => {
    if (!socket) return;
    const handleSlotUpdate = (data) => {
      if (data.accountId === accountId) setSlots(data.slots || []);
    };
    const handleSlotsSynced = (accountsWithSlots) => {
      const cur = accountsWithSlots.find((item) => item.accountId === accountId);
      if (cur) setSlots(cur.slots || []);
    };
    socket.on('slot_updated', handleSlotUpdate);
    socket.on('slots_synced', handleSlotsSynced);
    return () => {
      socket.off('slot_updated', handleSlotUpdate);
      socket.off('slots_synced', handleSlotsSynced);
    };
  }, [socket, accountId]);

  const totalSlots = account?.totalSlots || 2;
  const occupiedSlots = slots.filter((s) => s.memberId !== null);
  const isFull = occupiedSlots.length >= totalSlots;
  const serviceColor = getServiceColor(account?.serviceName);

  const handleClaimSlot = () => socket?.emit('claim_slot', { accountId });
  const handleReleaseSlot = (slotNumber) => socket?.emit('release_slot', { accountId, slotNumber });

  const handlePingAll = () => {
    if (!socket) return;
    occupiedSlots.forEach((slot) => socket.emit('nudge_slot', { accountId, slotNumber: slot.slotNumber }));
    const other = occupiedSlots.find((s) => s.memberId !== user?.memberId);
    setPingedUser(other?.memberName || 'Everyone');
    setShowPingModal(true);
  };

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={group?.name} />

      <main className="main-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="btn-icon"
            style={{ gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={20} /> <span>Back</span>
          </button>

          {isFull && (
            <button onClick={handlePingAll} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
              <Bell size={16} /> Ping All
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
          {/* Left: Slot management */}
          <div>
            {/* Service Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: serviceColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.4rem', color: '#fff',
                boxShadow: `0 4px 20px ${serviceColor}66`
              }}>
                {account?.serviceName?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.1 }}>
                  {account?.serviceName || 'Streaming Service'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
                  {occupiedSlots.length} of {totalSlots} slots in use
                  {isFull && (
                    <span style={{ marginLeft: '8px', color: '#f87171', fontSize: '0.78rem', fontWeight: 700 }}>
                      • Full
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Slot Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {Array.from({ length: totalSlots }).map((_, idx) => {
                const slotNumber = idx + 1;
                const slot = slots.find((s) => s.slotNumber === slotNumber);
                const isOccupied = slot && slot.memberId !== null;
                const isCurrentUser = slot && slot.memberId === user?.memberId;

                return (
                  <div
                    key={slotNumber}
                    className={`slot-card ${isOccupied ? (isCurrentUser ? 'mine' : 'occupied') : ''}`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '50%',
                        background: isOccupied ? '#252C3E' : 'rgba(255,255,255,0.03)',
                        border: isCurrentUser
                          ? '2px solid var(--status-watching)'
                          : isOccupied
                            ? '2px solid var(--accent-purple)'
                            : '1px dashed var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.95rem',
                        color: isOccupied ? '#fff' : 'var(--text-muted)'
                      }}>
                        {isOccupied
                          ? (slot.memberName ? slot.memberName.charAt(0).toUpperCase() : 'U')
                          : slotNumber}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                          {isOccupied
                            ? `${slot.memberName}${isCurrentUser ? ' (You)' : ''}`
                            : `Slot #${slotNumber}`}
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isOccupied ? (
                            <>
                              <div className="online-dot" style={{ width: '6px', height: '6px' }} />
                              <span style={{ color: 'var(--status-watching)' }}>Watching</span>
                              {slot.claimedAt && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  · <Clock size={10} style={{ verticalAlign: 'middle' }} /> {timeAgo(slot.claimedAt)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isOccupied ? (
                      isCurrentUser && (
                        <button
                          onClick={() => handleReleaseSlot(slotNumber)}
                          className="btn-secondary"
                          style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                        >
                          Release
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleClaimSlot}
                        className="btn-primary"
                        style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Info Card */}
            <div style={{
              background: 'var(--bg-card-inner)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {isFull
                  ? 'All slots are in use. Tap "Ping All" to ask if someone can free up a slot. If there\'s no response within 2 minutes, their slot will be released automatically.'
                  : 'Claim a slot to start watching. Release it when you\'re done so others can use it.'}
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Info size={15} color="var(--accent-purple-light)" />
                  <span>Auto-release: <strong>2 minutes</strong> after ping (no response)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Sliders size={15} />
                  <span>Change timer in group settings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Artwork panel */}
          <div style={{
            borderRadius: 'var(--radius-xl)',
            background: `radial-gradient(circle at 50% 30%, ${serviceColor}33, transparent 60%), #121522`,
            border: '1px solid var(--border-subtle)',
            minHeight: '420px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px', position: 'relative', overflow: 'hidden'
          }}>
            {/* Glow ring */}
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${serviceColor}, ${serviceColor}44)`,
              border: `2px solid ${serviceColor}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.5rem', boxShadow: `0 0 60px ${serviceColor}44`
            }}>
              🎭
            </div>

            <div className="doodle-text" style={{ marginTop: '32px', fontSize: '2rem', textAlign: 'center', transform: 'rotate(-4deg)' }}>
              Even Legends <br /> Share Accounts ♡
            </div>

            {/* Slot usage pill */}
            <div style={{
              position: 'absolute', bottom: '24px',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-full)', padding: '6px 16px',
              fontSize: '0.8rem', fontWeight: 700
            }}>
              {occupiedSlots.length} / {totalSlots} slots occupied
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
