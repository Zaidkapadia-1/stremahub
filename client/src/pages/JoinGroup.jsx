import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, ArrowLeft, ArrowRight, Sparkles, KeyRound, User } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import StreamHubLogo from '../components/StreamHubLogo';

export default function JoinGroup() {
  const { code: urlCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { account, updateUser } = useUser();

  const initialCode = (urlCode || searchParams.get('code') || '').trim().toUpperCase();
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep code state updated if URL parameter changes
  useEffect(() => {
    if (urlCode) {
      setInviteCode(urlCode.trim().toUpperCase());
    }
  }, [urlCode]);

  // Helper to extract clean alphanumeric code even if full URL is pasted
  const handleCodeChange = (e) => {
    let raw = e.target.value;
    const urlMatch = raw.match(/join\/([a-zA-Z0-9_-]+)/i);
    if (urlMatch) {
      raw = urlMatch[1];
    }
    setInviteCode(raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
    setError('');
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a valid invite code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/group/${cleanCode}/join`, {
        name: account?.name || 'Member'
      });

      const { groupId, memberId, role, sessionToken } = res.data;

      updateUser({
        groupId,
        memberId,
        sessionToken,
        role,
        name: account?.name || 'Member',
        inviteCode: cleanCode
      });

      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not join group. Please check the invite code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.16), transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(30px)'
      }} />

      {/* Top Bar / Navigation */}
      <header style={{
        padding: '24px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10
      }}>
        <button
          onClick={() => navigate('/')}
          className="btn-icon"
          style={{
            gap: '8px',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <StreamHubLogo size={36} showWord={true} wordSize="1.25rem" animate={false} />
        </div>

        <div style={{ width: '110px' }} /> {/* Spacer to keep brand center-ish */}
      </header>

      {/* Center Form Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 24px 60px',
        position: 'relative',
        zIndex: 5
      }}>
        <div
          className="animate-fade-in-up"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '40px 36px',
            width: '440px',
            maxWidth: '100%',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.65)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <span
              className="eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px'
              }}
            >
              <Sparkles size={13} color="var(--accent-purple-light)" />
              JOIN STREAMING GROUP
            </span>
            <h1 style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              margin: '6px 0 10px'
            }}>
              Join with Code
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              lineHeight: 1.55
            }}>
              {urlCode ? (
                <>
                  You're joining via an invite link. Enter your name below to jump into the group!
                </>
              ) : (
                <>
                  Enter the 6-character invite code shared by your friend to access shared streaming slots.
                </>
              )}
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '22px',
              fontSize: '0.88rem',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Invite Code Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <KeyRound size={15} color="var(--accent-purple-light)" />
                  Group Invite Code
                </label>
                {urlCode && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontWeight: 600
                  }}>
                    From Link
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. GDUNME or paste link"
                value={inviteCode}
                onChange={handleCodeChange}
                className="input-field"
                required
                autoFocus={!urlCode}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '13px 16px'
                }}
              />
            </div>

            {/* Authenticated Identity */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                <User size={15} color="var(--accent-purple-light)" />
                Joining As
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#fff'
                }}>
                  {(account?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#F8FAFC' }}>
                    {account?.name || 'Member'}
                  </div>
                  {account?.email && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {account.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '14px',
                fontSize: '0.98rem',
                fontWeight: 700,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                'Joining Group...'
              ) : (
                <>
                  <span>Join Group</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Create Group Link */}
          <div style={{
            marginTop: '28px',
            paddingTop: '22px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Want to start your own group? </span>
            <button
              onClick={() => navigate('/create')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-purple-light)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
