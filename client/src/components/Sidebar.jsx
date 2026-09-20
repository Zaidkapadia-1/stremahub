import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Home, Activity, MessageSquare, Users, Settings as SettingsIcon, Play, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';

export default function Sidebar({ membersCount = 0, groupName }) {
  const { groupId } = useParams();
  const { user, logout } = useUser();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [hasNewChat, setHasNewChat] = useState(false);

  // Listen for new events to show notification dots
  useEffect(() => {
    if (!socket) return;
    const handleActivity = () => setHasNewActivity(true);
    const handleChat = (msg) => {
      // Only show dot if it's from someone else
      if (msg.senderName !== user?.name) setHasNewChat(true);
    };
    socket.on('slot_updated', handleActivity);
    socket.on('chat_message', handleChat);
    return () => {
      socket.off('slot_updated', handleActivity);
      socket.off('chat_message', handleChat);
    };
  }, [socket, user?.name]);

  const navItems = [
    { name: 'Home',       path: `/group/${groupId}`,          icon: Home,         exact: true },
    { name: 'Activity',   path: `/group/${groupId}/activity`, icon: Activity,     dot: hasNewActivity, onActivate: () => setHasNewActivity(false) },
    { name: 'Group Chat', path: `/group/${groupId}/chat`,     icon: MessageSquare,dot: hasNewChat,     onActivate: () => setHasNewChat(false) },
    { name: 'Members',    path: `/group/${groupId}/members`,  icon: Users },
    { name: 'Settings',   path: `/group/${groupId}/settings`, icon: SettingsIcon },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', cursor: 'pointer' }}
        onClick={() => navigate(`/group/${groupId}`)}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent-grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.45)'
        }}>
          <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>StreamHub</span>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={item.onActivate}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-full)',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem',
                color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--nav-active-bg)' : 'transparent',
                border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
                position: 'relative'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {item.dot && !isActive && (
                    <div className="notif-badge" style={{ position: 'static', marginLeft: 'auto' }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Group Card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)', padding: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem'
          }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
              {groupName || user?.groupName || 'Your group'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{membersCount} member{membersCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <button onClick={() => navigate(`/group/${groupId}/settings`)} className="btn-icon" title="Group Settings">
          <SettingsIcon size={15} />
        </button>
      </div>

      {/* User profile row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px', borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#2A3144', border: '2px solid var(--accent-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem', fontWeight: 800, flexShrink: 0
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'Member'}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-icon" title="Switch User / Logout">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
