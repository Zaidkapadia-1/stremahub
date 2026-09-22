import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import StreamHubLogo from '../components/StreamHubLogo';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAccount } = useUser();

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || location.state?.from || '/my-groups';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      });

      loginAccount(res.data);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main, #080911)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top back button */}
      <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-icon"
          style={{ gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-card, #121422)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <StreamHubLogo size={42} showWord={true} wordSize="1.5rem" animate={false} />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '20px', marginBottom: '6px', textAlign: 'center' }}>
            Create your StreamHub account.
          </h1>
          <p style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '0.85rem', textAlign: 'center' }}>
            Keep your shared groups, accounts, and slots in one place.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#F87171',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '18px',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Confirm password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px'
            }}
          >
            <span>{loading ? 'Creating account…' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
          </span>
          <Link
            to={`/login${returnTo !== '/my-groups' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            style={{ fontSize: '0.85rem', color: 'var(--accent-purple-light, #c084fc)', fontWeight: 700, textDecoration: 'none' }}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
