import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  Bell, Clapperboard, DoorOpen, Plus, Sparkles,
  Film, Users, UserMinus, RefreshCw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import api from '../api';

const EVENT_CONFIG = {
  group_created: { icon: Sparkles,     color: 'yellow', label: 'created the group' },
  member_joined: { icon: DoorOpen,     color: 'green',  label: 'joined the group' },
  member_left:   { icon: UserMinus,    color: 'red',    label: 'left the group' },
  account_added: { icon: Film,         color: 'blue',   label: 'added an account' },
  slot_claimed:  { icon: Clapperboard, color: 'purple', label: 'claimed a slot' },
  slot_released: { icon: RefreshCw,    color: 'orange', label: 'released a slot' },
  slot_pinged:   { icon: Bell,         color: 'red',    label: 'pinged a slot' },
};

const FILTERS = ['All', 'Slots', 'Members', 'Accounts'];
const filterMap = {
  All:      null,
  Slots:    ['slot_claimed', 'slot_released', 'slot_pinged'],
  Members:  ['member_joined', 'member_left'],
  Accounts: ['account_added'],
};

const relativeTime = (date) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (minutes < 1)    return 'Just now';
  if (minutes < 60)   return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

const exactTime = (date) =>
  new Date(date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const avatarBg = (name = '') => {
  const colors = ['#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Activity() {
  const { groupId } = useParams();
  const [activities,    setActivities]    = useState([]);
  const [group,         setGroup]         = useState(null);
  const [membersCount,  setMembersCount]  = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [activeFilter,  setActiveFilter]  = useState('All');

  useEffect(() => {
    Promise.all([api.get(`/group/${groupId}`), api.get(`/group/${groupId}/activity`)])
      .then(([groupRes, actRes]) => {
        setGroup(groupRes.data.group);
        setMembersCount((groupRes.data.members || []).length);
        setActivities(actRes.data.activities || []);
      })
      .catch((err) => console.error('Failed to load activity:', err))
      .finally(() => setLoading(false));
  }, [groupId]);

  const filterTypes = filterMap[activeFilter];
  const filtered = filterTypes
    ? activities.filter((a) => filterTypes.includes(a.type))
    : activities;

  return (
    <div className="app-shell">
      <Sidebar groupName={group?.name} membersCount={membersCount} />

      <main className="main-content" style={{ maxWidth: '860px' }}>
        <TopNav
          title="Activity"
          subtitle={`A live record of everything happening in ${group?.name || 'your group'}`}
        />

        {/* Filter tabs */}
        <div className="timeline-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
          {!loading && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Timeline */}
        <section className="timeline-card" aria-busy={loading}>
          {loading ? (
            <div className="muted-state">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <RefreshCw size={18} style={{ animation: 'spinOnce 1s linear infinite' }} />
                Loading activity…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(168,85,247,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ActivityIcon size={24} color="var(--accent-purple-light)" />
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {activeFilter === 'All' ? 'No activity yet' : `No ${activeFilter.toLowerCase()} events yet`}
              </h2>
              <p style={{ fontSize: '0.86rem', maxWidth: '260px', lineHeight: 1.55 }}>
                {activeFilter === 'All'
                  ? 'Claims, releases, new members, and account changes will appear here.'
                  : 'Switch to a different filter to see other events.'}
              </p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const cfg  = EVENT_CONFIG[item.type] || { icon: ActivityIcon, color: '', label: item.detail };
              const Icon = cfg.icon;

              return (
                <article
                  key={item._id}
                  className="timeline-item"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  {/* Event icon */}
                  <div className={`timeline-icon ${cfg.color}`}>
                    <Icon size={15} />
                  </div>

                  {/* Actor avatar */}
                  <div
                    className="timeline-actor"
                    style={{ background: avatarBg(item.actorName) }}
                    title={item.actorName}
                  >
                    {item.actorName ? item.actorName.charAt(0).toUpperCase() : '?'}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>
                      <strong>{item.actorName}</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{item.detail || cfg.label}</span>
                    </p>
                  </div>

                  {/* Timestamp */}
                  <time
                    dateTime={item.createdAt}
                    title={exactTime(item.createdAt)}
                    style={{ cursor: 'help' }}
                  >
                    {relativeTime(item.createdAt)}
                  </time>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
