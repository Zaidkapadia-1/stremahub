import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, KeyRound, Users, Tv, LogOut, ArrowRight, Settings as SettingsIcon, Clock, Sparkles } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import StreamHubLogo from '../components/StreamHubLogo';

const relativeTime = (date) => {
  if (!date) return 'Recently';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date)) / 60000));
  if (minutes < 1)    return 'Just now';
  if (minutes < 60)   return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

export default function MyGroups() {
  const navigate = useNavigate();
  const { account, openGroup, fullLogout } = useUser();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account?.token) {
      navigate('/login', { state: { from: '/my-groups' } });
      return;
    }

    let isMounted = true;
    api.get('/auth/groups')
      .then((res) => {
        if (isMounted) {
          setGroups(res.data.groups || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to load your groups.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [account, navigate]);

  const handleOpenGroup = async (grp) => {
    try {
      await openGroup(grp.groupId, grp);
      navigate(`/group/${grp.groupId}`);
    } catch {
      // Fallback navigation if session already active or offline
      navigate(`/group/${grp.groupId}`);
    }
  };

  const handleLogout = () => {
    fullLogout();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main, #080911)',
      color: '#F8FAFC',
      padding: '24px 32px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <StreamHubLogo size={36} showWord={true} wordSize="1.3rem" animate={false} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {account && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {(account.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{account.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)' }}>{account.email}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Log Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              color: 'var(--text-secondary, #94A3B8)',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            My Groups
          </h1>
          <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.92rem' }}>
            Select a group to enter or start a new shared space.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/join')}
            className="btn-icon"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
              color: '#F8FAFC',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <KeyRound size={15} />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            <Plus size={16} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#F87171',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card" style={{ height: '180px' }}>
              <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '24px' }} />
              <div className="skeleton" style={{ height: '40px', borderRadius: '999px' }} />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div style={{
          background: 'var(--bg-card, #121422)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(139,92,246,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple-light, #c084fc)',
            margin: '0 auto 16px'
          }}>
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            No groups yet
          </h2>
          <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Create your first group to start managing streaming slots with your friends or family, or join one with an invite code.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              Create Group
            </button>
            <button
              onClick={() => navigate('/join')}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Join Group
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {groups.map((grp) => {
            const isOwner = grp.role === 'owner';
            const isAdmin = grp.role === 'admin';

            return (
              <div
                key={grp.groupId}
                style={{
                  background: 'var(--bg-card, #121422)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s, transform 0.2s',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: isOwner
                        ? 'rgba(139,92,246,0.18)'
                        : isAdmin
                        ? 'rgba(59,130,246,0.18)'
                        : 'rgba(255,255,255,0.08)',
                      color: isOwner
                        ? '#C084FC'
                        : isAdmin
                        ? '#60A5FA'
                        : '#94A3B8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {grp.role}
                    </span>

                    <span style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted, #64748B)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      {relativeTime(grp.lastActivity)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>
                    {grp.groupName}
                  </h3>

                  {/* Summary pills */}
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary, #94A3B8)' }}>
                      <Users size={14} color="#8B5CF6" />
                      <span>{grp.memberCount} member{grp.memberCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary, #94A3B8)' }}>
                      <Tv size={14} color="#34D399" />
                      <span>{grp.accountCount} account{grp.accountCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleOpenGroup(grp)}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Open Group</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await openGroup(grp.groupId, grp);
                      } catch {}
                      navigate(`/group/${grp.groupId}/settings`);
                    }}
                    className="btn-icon"
                    title="Group Settings"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                      color: 'var(--text-secondary, #94A3B8)'
                    }}
                  >
                    <SettingsIcon size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
