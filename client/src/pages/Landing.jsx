import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      backgroundImage: `linear-gradient(90deg, rgba(8,9,17,0.94) 0%, rgba(8,9,17,0.85) 36%, rgba(8,9,17,0.3) 65%, rgba(8,9,17,0.65) 100%), url('/hero-bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 64px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--accent-grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}>
            <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px' }}>StreamHub</span>
        </div>

        {/* Center Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>How it works</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>Pricing</a>
        </nav>

        {/* Right CTA */}
        <button
          onClick={() => navigate('/create')}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: '0.9rem' }}
        >
          Get Started
        </button>
      </header>

      {/* Main Hero Content */}
      <main style={{
        flex: 1,
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        padding: '40px 48px 60px 160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left Side Content */}
        <div style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Eyebrow / Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--accent-purple-light)'
            }}>
              STREAM TOGETHER
            </span>
            <div style={{ width: '40px', height: '2px', background: 'var(--accent-purple)' }} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: '4.2rem',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            color: '#FFFFFF'
          }}>
            Good Shows.<br />
            Better Friends.<br />
            <span className="grad-text">No Drama.</span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1.08rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '500px'
          }}>
            A shared dashboard for your streaming accounts. Know who's watching, claim your slot, and keep the good times streaming.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.98rem' }}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/create')}
              className="btn-secondary"
              style={{ padding: '14px 26px', fontSize: '0.98rem' }}
            >
              See How It Works
            </button>
          </div>

          {/* Trust Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
            <div style={{ display: 'flex' }}>
              {['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'].map((bg, i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: bg,
                  border: '2px solid #080911',
                  marginLeft: i === 0 ? 0 : '-10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  {['J', 'A', 'P', 'R', 'S'][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Trusted by 10,000+ friend groups
            </span>
          </div>
        </div>

        {/* Sketched Neon Doodles matching the reference image */}
        {/* Wall Frame 1 Doodle (Top Left Wall) */}
        <div className="doodle-text" style={{
          position: 'absolute',
          top: '60px',
          left: '26px',
          width: '95px',
          transform: 'rotate(-4deg)',
          fontSize: '1.15rem',
          lineHeight: 1.15,
          textAlign: 'center',
          opacity: 0.85
        }}>
          Good People <br />
          Great Shows ♡
        </div>

        {/* Wall Frame 2 Doodle (Lower Left Wall) */}
        <div className="doodle-text" style={{
          position: 'absolute',
          top: '260px',
          left: '26px',
          width: '95px',
          transform: 'rotate(-2deg)',
          fontSize: '1.1rem',
          lineHeight: 1.15,
          textAlign: 'center',
          opacity: 0.85
        }}>
          Less WhatsApp <br />
          More Watching
        </div>

        {/* Center Window Reflection Doodle */}
        <div className="doodle-text" style={{
          position: 'absolute',
          top: '160px',
          left: '52%',
          transform: 'rotate(5deg)',
          fontSize: '1.45rem',
          color: '#E879F9',
          opacity: 0.9
        }}>
          Good Shows <br />
          Better Friends ♡
        </div>

        {/* Right Neon Sign next to TV */}
        <div className="doodle-text" style={{
          position: 'absolute',
          top: '80px',
          right: '50px',
          transform: 'rotate(4deg)',
          fontSize: '1.5rem',
          color: '#F472B6',
          textAlign: 'right',
          textShadow: '0 0 20px rgba(244, 114, 182, 0.6)'
        }}>
          Different Screens <br />
          Same People ♡
        </div>

        {/* Bottom Left Couch Doodle */}
        <div className="doodle-text" style={{
          position: 'absolute',
          bottom: '18px',
          left: '70px',
          transform: 'rotate(-5deg)',
          fontSize: '1.35rem',
          color: '#D8B4FE',
          opacity: 0.85
        }}>
          Same Screen <br />
          Bigger Stories ♡
        </div>
      </main>
    </div>
  );
}
