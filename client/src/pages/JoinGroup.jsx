import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';

export default function JoinGroup() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/group/${code}/join`, {
        name: name.trim()
      });

      const { groupId, memberId, role, sessionToken } = res.data;

      updateUser({
        groupId,
        memberId,
        sessionToken,
        role,
        name: name.trim(),
        inviteCode: code
      });

      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group. Check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        width: '420px',
        maxWidth: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>StreamHub</span>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>Join Group</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          You've been invited with code: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{code}</strong>
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px' }}>
            {loading ? 'Joining...' : 'Join Group →'}
          </button>
        </form>
      </div>
    </div>
  );
}
