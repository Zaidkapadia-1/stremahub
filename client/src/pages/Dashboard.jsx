import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Tv2, Users, Activity, UserPlus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import AccountCard from '../components/AccountCard';
import api from '../api';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';

const timeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const relativeTime = (date) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
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

export default function Dashboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket } = useSocket();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [slotsByAccount, setSlotsByAccount] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [groupRes, actRes] = await Promise.all([
          api.get(`/group/${groupId}`),
          api.get(`/group/${groupId}/activity`).catch(() => ({ data: { activities: [] } }))
        ]);
        if (!isMounted) return;
        setGroup(groupRes.data.group);
        setMembers(groupRes.data.members || []);
        setAccounts(groupRes.data.accounts || []);
        setRecentActivity((actRes.data.activities || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load group:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (groupId) load();
    return () => { isMounted = false; };
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;
    const handleSlotUpdate = ({ accountId, slots }) => {
      setSlotsByAccount((prev) => ({ ...prev, [accountId]: slots }));
    };
    const handleSlotsSynced = (accountsWithSlots) => {
      setSlotsByAccount(Object.fromEntries(accountsWithSlots.map(({ accountId, slots }) => [accountId, slots])));
    };
    socket.on('slot_updated', handleSlotUpdate);
    socket.on('slots_synced', handleSlotsSynced);
    return () => {
      socket.off('slot_updated', handleSlotUpdate);
      socket.off('slots_synced', handleSlotsSynced);
    };
  }, [socket]);

  const filteredAccounts = accounts.filter((acc) =>
    acc.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const activeSlots = Object.values(slotsByAccount).flat().filter((s) => s.memberId !== null).length;
  const totalSlots  = accounts.reduce((sum, a) => sum + (a.totalSlots || 2), 0);

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={group?.name || 'My Group'} />

      <main className="main-content">
        <TopNav onSearch={setSearchQuery} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div className="animate-fade-in-up">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
              {timeOfDay()}, {user?.name || 'Friend'} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {group?.name || 'Your group'} — everything's streaming smoothly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => navigate(`/group/${groupId}/invite`)}
            >
              <UserPlus size={15} /> Invite
            </button>
            <button
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              onClick={() => navigate(`/group/${groupId}/add-accounts`)}
            >
              <Plus size={15} /> Add Account
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && (
          <div className="stats-bar animate-fade-in">
            <div className="stat-pill">
              <div className="stat-icon" style={{ background: 'rgba(96,165,250,0.15)' }}>
                <Tv2 size={13} color="#60a5fa" />
              </div>
              <span><span className="stat-value">{accounts.length}</span> accounts</span>
            </div>
            <div className="stat-pill">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Activity size={13} color="#10b981" />
              </div>
              <span><span className="stat-value">{activeSlots}</span> / {totalSlots} slots active</span>
            </div>
            <div className="stat-pill">
              <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>
                <Users size={13} color="#c084fc" />
              </div>
              <span><span className="stat-value">{members.length}</span> members</span>
            </div>
          </div>
        )}

        {/* Accounts Grid */}
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px 0' }}>Loading shared accounts…</div>
        ) : filteredAccounts.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '56px 48px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📺</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>No streaming accounts yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px', maxWidth: '340px', margin: '0 auto 24px' }}>
              Add Netflix, Prime Video, Disney+ or any shared account to start tracking slots.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '10px 28px' }}
              onClick={() => navigate(`/group/${groupId}/add-accounts`)}
            >
              <Plus size={16} /> Add Your First Account
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredAccounts.map((account, i) => (
              <div key={account._id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in-up">
                <AccountCard
                  account={account}
                  slots={slotsByAccount[account._id] || []}
                />
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity Mini Section */}
        {!loading && recentActivity.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--accent-purple-light)" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate(`/group/${groupId}/activity`)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple-light)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
            <div className="timeline-card">
              {recentActivity.map((item, i) => (
                <div className="timeline-item" key={item._id} style={{ animationDelay: `${i * 50}ms` }}>
                  <div className={`timeline-icon ${activityColors[item.type] || ''}`}>
                    <Activity size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.actorName}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}> {item.detail}</span>
                  </div>
                  <time style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
