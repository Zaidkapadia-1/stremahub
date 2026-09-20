import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, ArrowRight, Zap, Shield, Users, Bell,
  Tv2, Activity, MessageSquare, Star
} from 'lucide-react';

/* ── tiny reusable helpers ──────────────────────────────── */
const Pill = ({ children, color = '#a855f7' }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}44`,
    color, borderRadius: '999px', padding: '4px 14px',
    fontSize: '0.78rem', fontWeight: 700
  }}>
    {children}
  </span>
);

const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px',
    padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${color}55`;
      e.currentTarget.style.boxShadow = `0 8px 32px ${color}18`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '48px', height: '48px', borderRadius: '13px',
      background: `${color}18`, border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  </div>
);

const Step = ({ n, title, desc }) => (
  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
      background: 'var(--accent-grad)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 900, fontSize: '1rem',
      boxShadow: '0 4px 16px rgba(139,92,246,0.45)'
    }}>{n}</div>
    <div style={{ paddingTop: '6px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  </div>
);


export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#080911', color: '#fff', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════ NAVBAR ═════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,9,17,0.85)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 64px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(168,85,247,0.5)'
          }}>
            <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px' }}>StreamHub</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[['#features', 'Features'], ['#how-it-works', 'How it works']].map(([href, label]) => (
            <a key={href} href={href} style={{
              color: 'var(--text-secondary)', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.15s'
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{label}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/join')} style={{
            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '8px 16px'
          }}>Join Group</button>
          <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.88rem' }}>
            Get Started
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section style={{
        minHeight: '92vh', position: 'relative',
        backgroundImage: `linear-gradient(90deg, rgba(8,9,17,0.96) 0%, rgba(8,9,17,0.88) 38%, rgba(8,9,17,0.35) 68%, rgba(8,9,17,0.7) 100%), url('/hero-bg.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center',
        padding: '0 8% 0 10%'
      }}>
        {/* Purple glow blob */}
        <div style={{
          position: 'absolute', top: '20%', left: '28%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)',
          pointerEvents: 'none', filter: 'blur(20px)'
        }} />

        <div style={{ maxWidth: '620px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--accent-purple-light)'
            }}>STREAM TOGETHER</span>
            <div style={{ width: '36px', height: '2px', background: 'var(--accent-purple)' }} />
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
            fontWeight: 900, lineHeight: 1.04, letterSpacing: '-2px', marginBottom: '22px'
          }}>
            Good Shows.<br />Better Friends.<br />
            <span className="grad-text">No Drama.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '480px', marginBottom: '36px' }}>
            A shared dashboard for your streaming accounts. See who's watching, claim your slot, and stop the WhatsApp chaos — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '14px 30px', fontSize: '1rem' }}>
              Create a Group <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/join')} className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Join with Code
            </button>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex' }}>
              {['#8B5CF6','#EC4899','#3B82F6','#10B981','#F59E0B'].map((bg, i) => (
                <div key={i} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: bg, border: '2.5px solid #080911',
                  marginLeft: i === 0 ? 0 : '-10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.76rem', fontWeight: 700
                }}>
                  {['J','A','P','R','S'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Trusted by 10,000+ friend groups
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ FEATURES ═══════════════════════════ */}
      <section id="features" style={{ padding: '100px 10%', position: 'relative' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07), transparent 65%)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
          <Pill>✦ FEATURES</Pill>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, marginTop: '16px', marginBottom: '14px', letterSpacing: '-1px' }}>
            Everything your group needs
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            Stop the "who's using Netflix?" messages. StreamHub gives your group one place to manage shared streaming accounts.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          position: 'relative'
        }}>
          <FeatureCard icon={Tv2}          color="#60a5fa" title="Slot Management"        desc="See every slot across all your shared accounts in real time. Claim, release, and track with one click." />
          <FeatureCard icon={Bell}         color="#f87171" title="Smart Ping"             desc="Slots full? Send a nudge. If there's no response in 2 minutes, the slot auto-releases — no drama." />
          <FeatureCard icon={Activity}     color="#a78bfa" title="Activity Feed"          desc="A live timeline of every claim, release, and join. Know exactly what's happening in your group." />
          <FeatureCard icon={MessageSquare}color="#34d399" title="Group Chat"             desc="Chat right inside the app. Share memes, plan watch parties, and react to episodes together." />
          <FeatureCard icon={Users}        color="#fbbf24" title="Role Management"        desc="Owners can promote admins, invite new members, and remove people from the group easily." />
          <FeatureCard icon={Shield}       color="#f472b6" title="Private & Secure"       desc="No passwords shared publicly. Every session is authenticated via a secure session token." />
        </div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" style={{
        padding: '100px 10%',
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Pill color="#10b981">✦ HOW IT WORKS</Pill>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, marginTop: '16px', letterSpacing: '-1px' }}>
            Up and running in minutes
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px 60px',
          maxWidth: '960px', margin: '0 auto'
        }}>
          <Step n="1" title="Create your group"   desc="Give your group a name, choose an avatar, and get a private invite code in seconds. No sign-up required." />
          <Step n="2" title="Invite your people"   desc="Share the invite code or link via WhatsApp. Anyone can join instantly — just enter their name." />
          <Step n="3" title="Add shared accounts"  desc="Add Netflix, Prime Video, Disney+ or any service. Set how many slots each account has." />
          <Step n="4" title="Claim & stream"        desc="Members claim a slot when they want to watch. Release it when done. Everyone sees the live status." />
          <Step n="5" title="Ping if it's full"    desc="Need a slot but they're all taken? Hit Ping — the system asks someone to free up. Auto-release if no reply." />
          <Step n="6" title="Chat & coordinate"    desc="Built-in group chat so you can plan watch parties, share reactions, and coordinate everything in one place." />
        </div>
      </section>


      {/* ═══════════════════════════════ BOTTOM CTA ══════════════════════════ */}
      <section style={{
        padding: '90px 10%',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.14), transparent 65%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <Zap size={36} color="#a855f7" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '14px' }}>
          Ready to stream smarter?
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 1.65 }}>
          Create your group in 30 seconds. No credit card, no account, no drama.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Create a Group <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/join')} className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Join with a Code
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '28px 10%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'var(--accent-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Play size={13} fill="#fff" color="#fff" style={{ marginLeft: '1px' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>StreamHub</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © 2026 StreamHub. Built for friend groups who love good shows.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
