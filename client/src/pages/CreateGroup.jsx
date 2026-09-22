import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import StepProgress from '../components/StepProgress';
import StreamHubLogo from '../components/StreamHubLogo';

const avatars = ['🍿', '🎬', '📺', '🍕', '🎮'];

export default function CreateGroup() {
  const navigate = useNavigate();
  const { account, updateUser } = useUser();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please provide a group name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/group', {
        name: groupName.trim()
      });
      const { groupId, inviteCode, memberId, sessionToken } = res.data;
      updateUser({
        groupId, memberId, sessionToken,
        role: 'owner',
        name: account?.name || 'Owner',
        inviteCode,
        groupName: groupName.trim()
      });
      navigate(`/group/${groupId}/invite?from=create`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '36px 48px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button onClick={() => navigate(-1)} className="btn-icon" style={{ gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <StreamHubLogo size={32} showWord={true} wordSize="1.15rem" animate={false} />
          </div>
        </div>
        <StepProgress currentStep={1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '60px', alignItems: 'center' }}>
        {/* Form */}
        <div className="animate-fade-in-up">
          <span className="eyebrow">STEP 1 OF 3</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '10px 0 8px' }}>Create Your Group</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: 1.5 }}>
            Bring your people together and start managing your streaming accounts.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#F87171', padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              marginBottom: '20px', fontSize: '0.88rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Group Name</label>
              <input
                type="text"
                placeholder="e.g. Movie Buffs"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Group Owner
              </label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: 'var(--radius-md, 12px)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: '#fff'
                }}>
                  {(account?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC' }}>
                  {account?.name || 'You'} <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple-light, #c084fc)', fontWeight: 700 }}>(Owner)</span>
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>Group Avatar</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {avatars.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(index)}
                    style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: selectedAvatar === index
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.15))'
                        : '#141824',
                      border: selectedAvatar === index ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: selectedAvatar === index ? '0 0 16px rgba(139,92,246,0.35)' : 'none'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: '48px', height: '48px', borderRadius: '14px', border: '1px dashed var(--border-subtle)' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Description <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <textarea
                rows="3"
                placeholder='For the ones who always ask "Who&apos;s watching?"'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                style={{ resize: 'none' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', padding: '14px', fontSize: '1rem' }}>
              {loading ? 'Creating...' : 'Create Group — Next →'}
            </button>
          </form>
        </div>

        {/* Decorative Illustration */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '420px' }} className="animate-fade-in">
          <div style={{
            position: 'relative', width: '280px', height: '280px',
            border: '1px dashed rgba(168,85,247,0.35)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute', inset: '-20px', borderRadius: '50%',
              border: '1px dashed rgba(168,85,247,0.15)'
            }} />
            {/* Center */}
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'var(--accent-grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.6rem',
              boxShadow: '0 0 40px rgba(168,85,247,0.5)'
            }}>
              {avatars[selectedAvatar]}
            </div>

            {/* Orbit dots */}
            {[
              { top: '-18px', left: '106px', bg: '#4CAF50', char: 'A' },
              { bottom: '-18px', left: '106px', bg: '#00BCD4', char: 'P' },
              { top: '110px', left: '-18px', bg: '#9C27B0', char: 'R' },
              { top: '110px', right: '-18px', bg: '#FF9800', char: 'S' }
            ].map((node, i) => (
              <div key={i} style={{
                position: 'absolute', ...node,
                width: '42px', height: '42px', borderRadius: '50%',
                background: node.bg,
                border: '2.5px solid var(--bg-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.88rem',
                boxShadow: `0 4px 14px ${node.bg}66`
              }}>
                {node.char}
              </div>
            ))}
          </div>

          <div className="doodle-text" style={{ marginTop: '28px', textAlign: 'center', transform: 'rotate(-3deg)' }}>
            Same logins. <br /> More together.
          </div>
        </div>
      </div>
    </div>
  );
}
