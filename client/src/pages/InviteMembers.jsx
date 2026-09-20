import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Copy, Link, MessageCircle, Users, ArrowRight, Share2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StepProgress from '../components/StepProgress';
import api from '../api';

export default function InviteMembers() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('from') === 'create';

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api.get(`/group/${groupId}`)
      .then((res) => {
        setGroup(res.data.group);
        setMembers(res.data.members || []);
      })
      .catch((err) => console.error('Failed to load group:', err));
  }, [groupId]);

  const inviteCode = group?.inviteCode;
  const inviteUrl = inviteCode ? `${window.location.origin}/join/${inviteCode}` : '';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join my ${group?.name || 'StreamHub'} group 🎬\nCode: ${inviteCode}\nLink: ${inviteUrl}`)}`;

  const copy = async (value, name) => {
    await navigator.clipboard.writeText(value);
    setCopied(name);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Onboarding layout ──────────────────────────────────
  if (isOnboarding) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '36px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
          <button onClick={() => navigate(-1)} className="btn-icon" style={{ gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ← Back
          </button>
          <StepProgress currentStep={2} />
        </div>

        <div className="animate-fade-in-up" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <span className="eyebrow">STEP 2 OF 3</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '10px 0 8px' }}>Invite Your People</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '36px', lineHeight: 1.5 }}>
            Share this code with your friends. They join instantly — no account needed.
          </p>

          {/* Big Code Display */}
          <div className="invite-code-display" style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: '4px' }}>
              YOUR GROUP CODE
            </p>
            <span className="invite-code-value">{inviteCode || '······'}</span>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                className={copied === 'code' ? 'btn-primary' : 'btn-secondary'}
                disabled={!inviteCode}
                onClick={() => copy(inviteCode, 'code')}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {copied === 'code' ? <><Check size={15} style={{ animation: 'checkPop 0.3s ease' }} /> Copied!</> : <><Copy size={15} /> Copy Code</>}
              </button>
              <button
                className="whatsapp-button"
                disabled={!inviteUrl}
                onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
              >
                <MessageCircle size={16} /> Share on WhatsApp
              </button>
            </div>
          </div>

          {/* Invite Link */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              INVITE LINK
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input id="invite-link" className="input-field" readOnly value={inviteUrl} style={{ fontSize: '0.85rem' }} />
              <button
                className="btn-primary"
                disabled={!inviteUrl}
                onClick={() => copy(inviteUrl, 'link')}
                style={{ padding: '10px 16px', flexShrink: 0, fontSize: '0.85rem' }}
              >
                {copied === 'link' ? <Check size={16} /> : <Link size={16} />}
                {copied === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Members who joined */}
          {members.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="var(--accent-purple-light)" />
                <span style={{ color: 'var(--text-secondary)' }}>Members joined ({members.length})</span>
              </h3>
              <div className="member-preview">
                {members.map((m) => (
                  <div key={m._id} className="member-chip">
                    <span>{m.name.charAt(0).toUpperCase()}</span>
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Step CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
            <button
              onClick={() => navigate(`/group/${groupId}`)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Skip for now
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate(`/group/${groupId}/add-accounts?from=create`)}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              Next: Add Accounts <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Standalone (from dashboard) layout ────────────────
  return (
    <div className="app-shell">
      <Sidebar groupName={group?.name} membersCount={members.length} />
      <main className="main-content" style={{ maxWidth: '900px' }}>
        <span className="eyebrow">GROW YOUR GROUP</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>Invite Members</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Share a private link or code. Anyone who joins will appear in your members list right away.
        </p>

        <div className="invite-panel">
          {/* Big code */}
          <div className="invite-code-display">
            <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)' }}>GROUP CODE</p>
            <span className="invite-code-value">{inviteCode || '······'}</span>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                className={copied === 'code' ? 'btn-primary' : 'btn-secondary'}
                disabled={!inviteCode}
                onClick={() => copy(inviteCode, 'code')}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {copied === 'code' ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Code</>}
              </button>
            </div>
          </div>

          {/* Link row */}
          <div>
            <label htmlFor="invite-link-dash" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              INVITE LINK
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input id="invite-link-dash" className="input-field" readOnly value={inviteUrl} />
              <button className="btn-primary" disabled={!inviteUrl} onClick={() => copy(inviteUrl, 'link')} style={{ flexShrink: 0, padding: '10px 16px' }}>
                {copied === 'link' ? <Check size={16} /> : <Link size={16} />}
                {copied === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="whatsapp-button" disabled={!inviteUrl} onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}>
              <MessageCircle size={16} /> Share on WhatsApp
            </button>
            {navigator.share && (
              <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.88rem' }} onClick={() =>
                navigator.share({ title: `Join ${group?.name}`, url: inviteUrl })
              }>
                <Share2 size={15} /> Share…
              </button>
            )}
          </div>
        </div>

        {/* Current members */}
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-purple-light)" />
            Current members ({members.length})
          </h2>
          <div className="member-preview">
            {members.map((m) => (
              <div key={m._id} className="member-chip">
                <span>{m.name.charAt(0).toUpperCase()}</span>
                {m.name}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
