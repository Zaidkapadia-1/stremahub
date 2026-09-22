import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useParams, useNavigate, Link } from 'react-router-dom';
import {
  Home, Activity, MessageSquare, Users,
  Settings as SettingsIcon, LogOut, ChevronDown, Check, FolderKanban, Plus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import StreamHubLogo from './StreamHubLogo';
import api from '../api';

export default function Sidebar({ membersCount = 0, groupName }) {
  const { groupId } = useParams();
  const { user, account, openGroup, fullLogout } = useUser();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [hasNewChat,     setHasNewChat]     = useState(false);
  const [connected,      setConnected]      = useState(socket?.connected ?? false);

  // Group switcher state
  const [userGroups, setUserGroups] = useState([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  /* Notification dots */
  useEffect(() => {
    if (!socket) return;
    const onActivity = ()    => setHasNewActivity(true);
    const onChat     = (msg) => { if (msg.senderName !== user?.name) setHasNewChat(true); };
    const onConnect  = ()    => setConnected(true);
    const onDisconn  = ()    => setConnected(false);

    socket.on('slot_updated',  onActivity);
    socket.on('chat_message',  onChat);
    socket.on('connect',       onConnect);
    socket.on('disconnect',    onDisconn);

    setConnected(socket.connected);

    return () => {
      socket.off('slot_updated',  onActivity);
      socket.off('chat_message',  onChat);
      socket.off('connect',       onConnect);
      socket.off('disconnect',    onDisconn);
    };
  }, [socket, user?.name]);

  /* Load user's other groups for the group switcher if logged in */
  useEffect(() => {
    if (!account?.token) return;
    let isMounted = true;
    api.get('/auth/groups')
      .then((res) => {
        if (isMounted) setUserGroups(res.data.groups || []);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [account?.token, groupId]);

  /* Close switcher when clicking outside */
  useEffect(() => {
    function handleClickOutside(e) {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    }
    if (switcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [switcherOpen]);

  const navItems = [
    { name: 'Home',       path: `/group/${groupId}`,          icon: Home,          exact: true },
    { name: 'Activity',   path: `/group/${groupId}/activity`, icon: Activity,      dot: hasNewActivity, onActivate: () => setHasNewActivity(false) },
    { name: 'Chat',       path: `/group/${groupId}/chat`,     icon: MessageSquare, dot: hasNewChat,     onActivate: () => setHasNewChat(false) },
    { name: 'Members',    path: `/group/${groupId}/members`,  icon: Users },
    { name: 'Settings',   path: `/group/${groupId}/settings`, icon: SettingsIcon },
  ];

  const handleLogout = () => {
    fullLogout();
    navigate('/');
  };

  const handleSwitchGroup = async (grp) => {
    setSwitcherOpen(false);
    try {
      await openGroup(grp.groupId, grp);
      navigate(`/group/${grp.groupId}`);
    } catch {
      navigate(`/group/${grp.groupId}`);
    }
  };

  const displayName = groupName || user?.groupName || 'Current group';
  const userName    = account?.name || user?.name || 'User';
  const userEmail   = account?.email || user?.email || (account ? 'Account' : '');

  return (
    <aside className="sidebar">
      {/* Unified Brand Header */}
      <div
        className="sidebar__brand"
        onClick={() => navigate(`/group/${groupId}`)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <StreamHubLogo size={32} showWord={true} wordSize="1.15rem" animate={false} />
        <div className={`sidebar__conn ${connected ? 'sidebar__conn--live' : 'sidebar__conn--off'}`}>
          <span className="sidebar__conn-dot" />
          {connected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginTop: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={item.onActivate}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: 'var(--radius-full)',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
                color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--nav-active-bg)' : 'transparent',
                border: isActive ? '1px solid rgba(139,92,246,0.22)' : '1px solid transparent',
                transition: 'all 0.14s',
                position: 'relative',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} />
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

      {/* Group Switcher / Info */}
      <div ref={switcherRef} style={{ position: 'relative', marginBottom: '12px' }}>
        <div
          onClick={() => setSwitcherOpen((p) => !p)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'border-color 0.15s'
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {membersCount} member{membersCount !== 1 ? 's' : ''}
            </div>
          </div>
          <ChevronDown
            size={14}
            color="var(--text-muted)"
            style={{
              transform: switcherOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
              flexShrink: 0
            }}
          />
        </div>

        {/* Dropdown Menu */}
        {switcherOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card, #121422)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '8px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', padding: '4px 8px', letterSpacing: '0.04em' }}>
              SWITCH GROUP
            </div>

            {userGroups.map((grp) => {
              const isCurrent = grp.groupId === groupId;
              return (
                <div
                  key={grp.groupId}
                  onClick={() => handleSwitchGroup(grp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: isCurrent ? 'rgba(139,92,246,0.12)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: isCurrent ? '#F8FAFC' : 'var(--text-secondary)'
                  }}
                >
                  <span style={{ fontWeight: isCurrent ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {grp.groupName}
                  </span>
                  {isCurrent && <Check size={14} color="#C084FC" />}
                </div>
              );
            })}

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
              <button
                onClick={() => { setSwitcherOpen(false); navigate('/my-groups'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--accent-purple-light, #c084fc)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <FolderKanban size={13} />
                <span>All My Groups</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent User Profile Area */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
      }}>
        <div
          onClick={() => navigate('/my-groups')}
          style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, cursor: 'pointer', flex: 1 }}
          title="Go to My Groups"
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: '#2A3144', border: '2px solid var(--accent-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800,
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            {userEmail ? (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </div>
            ) : (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role || 'Member'}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="btn-icon" title="Log Out" style={{ flexShrink: 0, marginLeft: '6px' }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
