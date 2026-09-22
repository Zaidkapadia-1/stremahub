import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StreamHubLogo from './StreamHubLogo';
import { useUser } from '../../context/UserContext';

const NAV_LINKS = [
  { href: '#problem',     label: 'Why StreamHub' },
  { href: '#features',    label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#live-demo',   label: 'Preview' },
];

export default function LandingNav() {
  const navigate = useNavigate();
  const { account } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 40);
      lastScrollY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    setMenuOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header
      className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}
      role="banner"
    >
      <div className="landing-nav__inner">
        {/* ── Logo ── */}
        <button
          className="landing-nav__logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <StreamHubLogo size={32} wordSize="1.2rem" animate={false} />
        </button>

        {/* ── Center Links (desktop) ── */}
        <nav className="landing-nav__links" aria-label="Page sections">
          {NAV_LINKS.map(({ href, label }) => (
            <button
              key={href}
              className="landing-nav__link"
              onClick={() => scrollTo(href)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ── Right CTA (desktop) ── */}
        <div className="landing-nav__actions">
          {account ? (
            <button
              className="btn-primary landing-nav__cta"
              onClick={() => navigate('/my-groups')}
            >
              My Groups
            </button>
          ) : (
            <>
              <button
                className="landing-nav__ghost"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button
                className="landing-nav__ghost"
                onClick={() => navigate('/join')}
              >
                Join Group
              </button>
              <button
                className="btn-primary landing-nav__cta"
                onClick={() => navigate('/create')}
              >
                Create a Group
              </button>
            </>
          )}
        </div>

        {/* ── Mobile menu button ── */}
        <button
          className="landing-nav__burger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`landing-nav__burger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`landing-nav__burger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`landing-nav__burger-bar ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <nav className="landing-nav__mobile-menu" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <button
              key={href}
              className="landing-nav__mobile-link"
              onClick={() => scrollTo(href)}
            >
              {label}
            </button>
          ))}
          <div className="landing-nav__mobile-actions">
            {account ? (
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setMenuOpen(false); navigate('/my-groups'); }}
              >
                My Groups
              </button>
            ) : (
              <>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setMenuOpen(false); navigate('/login'); }}
                >
                  Log In
                </button>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setMenuOpen(false); navigate('/join'); }}
                >
                  Join Group
                </button>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setMenuOpen(false); navigate('/create'); }}
                >
                  Create a Group
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
