import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Tv2, Users, Activity, UserPlus, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AccountCard from '../components/AccountCard';
import api from '../api';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';

const relativeTime = (date) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (minutes < 1)    return 'Just now';
  if (minutes < 60)   return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

const activityColors = {
  group_created: 'yellow',
  member_joined: 'green',
  account_added: 'blue',
  slot_claimed:  'purple',
  slot_released: 'orange',
  slot_pinged:   'red',
};

function SkeletonCard() {
  return (
    <div className="skeleton-card" style={{ height: '190px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 14, width: '60%' }} />
          <div className="skeleton" style={{ height: 11, width: '35%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 38, borderRadius: 10, marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
    </div>
  );
}

export default function Dashboard() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const { user, account } = useUser();
  const { socket, slotsByAccount = {}, requestSlotsSync } = useSocket();

  const [group,           setGroup]           = useState(null);
  const [members,         setMembers]         = useState([]);
  const [accounts,        setAccounts]        = useState([]);
  const [recentActivity,  setRecentActivity]  = useState([]);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [loading,         setLoading]         = useState(true);

  // Synchronize slots immediately on mount and when groupId changes
  useEffect(() => {
    if (requestSlotsSync) {
      requestSlotsSync();
    }
  }, [groupId, requestSlotsSync]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [groupRes, actRes] = await Promise.all([
          api.get(`/group/${groupId}`),
          api.get(`/group/${groupId}/activity`).catch(() => ({ data: { activities: [] } })),
        ]);
        if (!isMounted) return;
        setGroup(groupRes.data.group);
        setMembers(groupRes.data.members || []);
        setAccounts(groupRes.data.accounts || []);
        setRecentActivity((actRes.data.activities || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load group:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (groupId) load();
    return () => { isMounted = false; };
  }, [groupId]);

  const filteredAccounts = accounts.filter((acc) =>
    acc.serviceName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const activeSlots = Object.values(slotsByAccount).flat().filter((s) => s.memberId !== null).length;
  const totalSlots  = accounts.reduce((sum, a) => sum + (a.totalSlots || 2), 0);
  const groupName   = group?.name || user?.groupName || 'My Group';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentUserName = account?.name || user?.name || 'Viewer';

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={groupName} />

      <main className="main-content">
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {getGreeting()}, {currentUserName}
            </h1>
            <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.92rem' }}>
              Here's what's available in <strong style={{ color: '#F8FAFC' }}>{groupName}</strong>.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate(`/group/${groupId}/invite`)}
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
            <button
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate(`/group/${groupId}/add-accounts`)}
            >
              <Plus size={14} />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Search and Compact Summary Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {/* Compact Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="stat-pill">
              <Tv2 size={13} color="#60a5fa" />
              <span><strong style={{ color: '#F8FAFC' }}>{accounts.length}</strong> accounts</span>
            </div>
            <div className="stat-pill stat-pill--active">
              <Activity size={13} color="#c084fc" />
              <span><strong style={{ color: '#F8FAFC' }}>{activeSlots}</strong> / {totalSlots} slots active</span>
            </div>
            <div className="stat-pill">
              <Users size={13} color="#60a5fa" />
              <span><strong style={{ color: '#F8FAFC' }}>{members.length}</strong> {members.length === 1 ? 'member' : 'members'}</span>
            </div>
          </div>

          {/* Instant Search input */}
          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search shared accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', fontSize: '0.84rem', width: '100%' }}
              aria-label="Search shared accounts"
            />
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : filteredAccounts.length === 0 ? (
          searchQuery.trim() ? (
            <div style={{
              background: 'var(--bg-card, #121422)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontSize: '0.95rem' }}>No shared account matches that search.</p>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-purple-light, #c084fc)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginTop: '8px',
                  cursor: 'pointer'
                }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)', border: '1px dashed var(--border-subtle)',
              borderRadius: '18px', padding: '56px 48px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📺</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
                No streaming accounts yet
              </h3>
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.9rem',
                marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px',
                lineHeight: 1.55,
              }}>
                Add Netflix, Prime Video, Disney+ or any shared account so your group can start coordinating slots.
              </p>
              <button
                className="btn-primary"
                style={{ padding: '10px 28px' }}
                onClick={() => navigate(`/group/${groupId}/add-accounts`)}
              >
                <Plus size={16} /> Add Your First Account
              </button>
            </div>
          )
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '18px',
          }}>
            {filteredAccounts.map((account, i) => (
              <div
                key={account._id}
                style={{ animationDelay: `${i * 45}ms` }}
                className="animate-fade-in-up"
              >
                <AccountCard
                  account={account}
                  slots={slotsByAccount[account._id] || []}
                />
              </div>
            ))}
          </div>
        )}

        {/* Recent activity */}
        {!loading && recentActivity.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '14px',
            }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Activity size={15} color="var(--accent-purple-light)" />
                Recent activity
              </h2>
              <button
                onClick={() => navigate(`/group/${groupId}/activity`)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--accent-purple-light)', fontSize: '0.8rem',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                View all →
              </button>
            </div>

            <div className="timeline-card">
              {recentActivity.map((item, i) => (
                <div
                  key={item._id}
                  className="timeline-item"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <div className={`timeline-icon ${activityColors[item.type] || ''}`}>
                    <Activity size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{item.actorName}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}> {item.detail}</span>
                  </div>
                  <time style={{ color: 'var(--text-muted)', fontSize: '0.74rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {relativeTime(item.createdAt)}
                  </time>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
