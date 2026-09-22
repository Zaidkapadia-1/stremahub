import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Crown, UserMinus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api';
import { useUser } from '../context/UserContext';

const avatarBg = (name = '') => {
  const colors = ['#7c3aed','#ec4899','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Members() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useUser();

  const [members,      setMembers]      = useState([]);
  const [group,        setGroup]        = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [loading,      setLoading]      = useState(true);

  const [confirmState, setConfirmState] = useState({
    open: false, memberId: null, memberName: '',
    action: null, actionLabel: '', title: '', message: '', loading: false,
  });

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/group/${groupId}`);
      setGroup(res.data.group);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [groupId]);

  const isOwner   = user?.role === 'owner';
  const isManager = user?.role === 'owner' || user?.role === 'admin';

  const openConfirm  = ({ memberId, memberName, action, actionLabel, title, message }) => {
    setActiveMenuId(null);
    setConfirmState({ open: true, memberId, memberName, action, actionLabel, title, message, loading: false });
  };
  const closeConfirm = () => setConfirmState((p) => ({ ...p, open: false }));

  const handleConfirm = async () => {
    setConfirmState((p) => ({ ...p, loading: true }));
    try {
      await confirmState.action();
      fetchMembers();
      closeConfirm();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
      setConfirmState((p) => ({ ...p, loading: false }));
    }
  };

  const handleUpdateRole = (memberId, newRole, memberName) => {
    openConfirm({
      memberId, memberName,
      title: newRole === 'admin' ? `Promote ${memberName}?` : `Demote ${memberName}?`,
      message: newRole === 'admin'
        ? `${memberName} will become an admin and can manage accounts and members.`
        : `${memberName} will be demoted back to a regular member.`,
      actionLabel: newRole === 'admin' ? 'Promote' : 'Demote',
      action: () => api.patch(`/group/${groupId}/member/${memberId}/role`, {
        requesterId: user?.memberId, newRole,
      }),
    });
  };

  const handleTransferOwnership = (memberId, memberName) => {
    openConfirm({
      memberId, memberName,
      title: `Transfer ownership to ${memberName}?`,
      message: `${memberName} will become the owner of this group. You will become an admin.`,
      actionLabel: 'Transfer Ownership',
      action: () => api.post(`/group/${groupId}/transfer-ownership`, {
        newOwnerMemberId: memberId
      }),
    });
  };

  const handleRemoveMember = (memberId, memberName) => {
    openConfirm({
      memberId, memberName,
      title: `Remove ${memberName}?`,
      message: `${memberName} will be removed from the group and lose access to all shared accounts.`,
      actionLabel: 'Remove',
      action: () => api.delete(`/group/${groupId}/member/${memberId}`, {
        data: { requesterId: user?.memberId },
      }),
    });
  };

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={group?.name} />

      <main className="main-content">
        <TopNav
          title="Members"
          subtitle={`${members.length} member${members.length !== 1 ? 's' : ''} sharing accounts`}
          actions={
            <button
              onClick={() => navigate(`/group/${groupId}/invite`)}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              <Plus size={14} /> Invite
            </button>
          }
        />

        {/* Members list */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading members…
            </div>
          ) : members.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                No members yet. Invite your group to get started.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate(`/group/${groupId}/invite`)}
                style={{ padding: '9px 22px' }}
              >
                <Plus size={14} /> Invite Members
              </button>
            </div>
          ) : (
            members.map((m, index) => {
              const isMe          = m._id === user?.memberId;
              const isOwnerMember = m.role === 'owner';
              const isAdminMember = m.role === 'admin';

              return (
                <div
                  key={m._id}
                  style={{
                    padding: '14px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: index < members.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    position: 'relative', transition: 'background 0.14s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Member info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: avatarBg(m.name),
                      border: isOwnerMember
                        ? '2.5px solid #FFA053'
                        : isAdminMember
                        ? '2px solid var(--accent-purple)'
                        : '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.95rem', color: '#fff',
                      boxShadow: isOwnerMember ? '0 0 12px rgba(255,160,83,0.4)' : 'none',
                      flexShrink: 0,
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.9rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '7px',
                      }}>
                        <span>{m.name}{isMe && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> (You)</span>}</span>
                        {isOwnerMember && <Crown size={14} color="#FFA053" fill="#FFA053" />}
                      </div>
                      <span style={{
                        fontSize: '0.73rem', fontWeight: 600, textTransform: 'capitalize',
                        color: isOwnerMember ? '#FFA053' : isAdminMember ? 'var(--accent-purple-light)' : 'var(--text-muted)',
                      }}>
                        {m.role}
                      </span>
                    </div>
                  </div>

                  {/* Action menu */}
                  {isManager && !isOwnerMember && !isMe && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === m._id ? null : m._id)}
                        className="btn-icon"
                      >
                        <MoreVertical size={17} />
                      </button>

                      {activeMenuId === m._id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%',
                          background: '#1A1E2B', border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                          zIndex: 50, minWidth: '170px', overflow: 'hidden',
                          animation: 'scaleIn 0.15s ease',
                        }}>
                          <button
                            onClick={() => handleUpdateRole(m._id, m.role === 'member' ? 'admin' : 'member', m.name)}
                            style={{
                              width: '100%', padding: '10px 16px', background: 'transparent',
                              border: 'none', color: '#fff', textAlign: 'left', fontSize: '0.84rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px',
                              borderBottom: '1px solid var(--border-subtle)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Crown size={13} color="var(--accent-purple-light)" />
                            {m.role === 'member' ? 'Promote to Admin' : 'Demote to Member'}
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleTransferOwnership(m._id, m.name)}
                              style={{
                                width: '100%', padding: '10px 16px', background: 'transparent',
                                border: 'none', color: '#FFA053', textAlign: 'left', fontSize: '0.84rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px',
                                borderBottom: '1px solid var(--border-subtle)',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,160,83,0.08)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Crown size={13} color="#FFA053" /> Transfer Ownership
                            </button>
                          )}
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveMember(m._id, m.name)}
                              style={{
                                width: '100%', padding: '10px 16px', background: 'transparent',
                                border: 'none', color: '#f87171', textAlign: 'left', fontSize: '0.84rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <UserMinus size={13} /> Remove from group
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.actionLabel}
        cancelLabel="Cancel"
        variant={confirmState.actionLabel === 'Remove' ? 'danger' : 'default'}
        loading={confirmState.loading}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
