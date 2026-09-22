import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Tv, Bell, Timer, Moon, Sun, LogOut, Trash2, X, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import { useUser } from '../context/UserContext';
import api from '../api';

export default function Settings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useUser();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('streamhub_notif') ?? 'true'); }
    catch { return true; }
  });
  const [darkMode, setDarkMode] = useState(true);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.get(`/group/${groupId}`)
      .then((res) => {
        setGroup(res.data.group);
        setMembers(res.data.members || []);
      })
      .catch(console.error);
  }, [groupId]);

  const toggleNotif = () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem('streamhub_notif', JSON.stringify(next));
  };

  const handleLeaveGroup = async () => {
    setActionError('');
    try {
      await api.post(`/group/${groupId}/leave`);
      logout();
      navigate('/my-groups');
    } catch (err) {
      setLeaveConfirm(false);
      setActionError(err.response?.data?.error || 'Could not leave group.');
    }
  };

  const handleDeleteGroup = async () => {
    setActionError('');
    try {
      await api.delete(`/group/${groupId}`);
      logout();
      navigate('/my-groups');
    } catch (err) {
      setDeleteConfirm(false);
      setActionError(err.response?.data?.error || 'Failed to delete group.');
    }
  };

  const isOwner = user?.role === 'owner' || members.find((m) => m._id === user?.memberId)?.role === 'owner';
  const autoRelease = group?.autoReleaseMinutes ?? 2;

  return (
    <div className="app-shell">
      <Sidebar membersCount={members.length} groupName={group?.name} />

      <main className="main-content" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => navigate(`/group/${groupId}`)} className="btn-icon">
            <X size={20} />
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Settings</h1>
        </div>

        {actionError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#F87171',
            padding: '14px 18px',
            borderRadius: '14px',
            marginBottom: '24px',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{actionError}</span>
            </div>
            {actionError.includes('Transfer ownership') && (
              <button
                onClick={() => navigate(`/group/${groupId}/members`)}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Members →
              </button>
            )}
          </div>
        )}

        {/* Navigation Settings */}
        <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>
          GROUP MANAGEMENT
        </p>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '24px'
        }}>
          {[
            { icon: Users, label: 'Group Members', sub: `${members.length} members · Manage roles and permissions`, action: () => navigate(`/group/${groupId}/members`) },
            { icon: Tv,    label: 'Manage Accounts', sub: 'Add, remove, or edit shared streaming accounts', action: () => navigate(`/group/${groupId}/add-accounts`) },
          ].map((row, i, arr) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                onClick={row.action}
                className="setting-row-hover"
                style={{
                  padding: '18px 20px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple-light)' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{row.label}</div>
                    {row.sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{row.sub}</div>}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>

        {/* Preferences */}
        <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>
          PREFERENCES
        </p>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '24px'
        }}>
          {/* Notifications Toggle */}
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: notifEnabled ? 'var(--accent-purple-light)' : 'var(--text-muted)' }}>
                <Bell size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Notifications</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {notifEnabled ? 'Enabled — you\'ll be notified on pings' : 'Disabled'}
                </div>
              </div>
            </div>
            <label className="toggle-switch" title="Toggle notifications">
              <input type="checkbox" checked={notifEnabled} onChange={toggleNotif} />
              <span className="toggle-track" />
            </label>
          </div>

          {/* Theme Toggle */}
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Theme</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {darkMode ? 'Dark mode' : 'Light mode'}
                </div>
              </div>
            </div>
            <label className="toggle-switch" title="Toggle theme">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode((p) => !p)} />
              <span className="toggle-track" />
            </label>
          </div>

          {/* Auto-release Timer */}
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Timer size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Auto-release Timer</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Slots auto-release after being pinged</div>
              </div>
            </div>
            <span style={{
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
              color: 'var(--accent-purple-light)',
              borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700
            }}>
              {autoRelease} min
            </span>
          </div>
        </div>

        {/* Danger Zone */}
        <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>
          DANGER ZONE
        </p>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden'
        }}>
          {/* Leave Group */}
          <div
            onClick={() => { setActionError(''); setLeaveConfirm(true); }}
            className="setting-row-hover"
            style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isOwner ? '1px solid rgba(239,68,68,0.15)' : 'none', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#f87171' }}>
              <LogOut size={18} />
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Leave Group</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {isOwner ? 'Requires transferring ownership if other members exist' : 'Relinquish membership in this group'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Delete Group (Owner only) */}
          {isOwner && (
            <div
              onClick={() => { setActionError(''); setDeleteConfirm(true); }}
              className="setting-row-hover"
              style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(239,68,68,0.03)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ef4444' }}>
                <Trash2 size={18} />
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Delete Group Permanently</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Permanently delete this group, its accounts, chat, and all slot records
                  </p>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          )}
        </div>
      </main>

      {/* Leave Group Confirmation */}
      <ConfirmDialog
        isOpen={leaveConfirm}
        title="Leave this group?"
        message="You will leave this group space. You can rejoin anytime using the group invite code."
        confirmLabel="Leave Group"
        cancelLabel="Stay"
        variant="danger"
        onConfirm={handleLeaveGroup}
        onCancel={() => setLeaveConfirm(false)}
      />

      {/* Delete Group Permanently Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete this group permanently?"
        message="This cannot be undone. All shared accounts, active slots, group chat messages, and member permissions will be erased forever."
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Group"
        variant="danger"
        onConfirm={handleDeleteGroup}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
