import React from 'react';
import { useNavigate } from 'react-router-dom';
import StreamHubLogo from './StreamHubLogo';

const FOOTER_LINKS = [
  { label: 'Features',    href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Create group', route: '/create' },
  { label: 'Join group',   route: '/join' },
];

export default function LandingFooter() {
  const navigate = useNavigate();

  function handleLink(link) {
    if (link.route) {
      navigate(link.route);
    } else {
      const el = document.querySelector(link.href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="landing-footer__inner">
        {/* Brand */}
        <div className="landing-footer__brand">
          <StreamHubLogo size={28} wordSize="1rem" animate={false} />
          <p className="landing-footer__desc">
            A shared coordination layer for streaming groups.
          </p>
        </div>

        {/* Navigation */}
        <nav className="landing-footer__nav" aria-label="Footer navigation">
          {FOOTER_LINKS.map(link => (
            <button
              key={link.label}
              className="landing-footer__link"
              onClick={() => handleLink(link)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="landing-footer__bottom">
        <p className="landing-footer__copy">
          © 2026 StreamHub
        </p>
      </div>
    </footer>
  );
}
