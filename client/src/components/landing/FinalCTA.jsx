import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="landing-final-cta"
      aria-labelledby="final-cta-heading"
      ref={ref}
    >
      {/* Ambient glow */}
      <div className="landing-final-cta__glow" aria-hidden="true" />

      <motion.div
        className="landing-final-cta__inner"
        initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          id="final-cta-heading"
          className="landing-final-cta__heading"
        >
          Stop asking who is watching.<br />
          <span className="grad-text">Start seeing it.</span>
        </h2>

        <p className="landing-final-cta__sub">
          Create a shared group, add the accounts your group already uses,
          and keep availability visible in one place.
        </p>

        <div className="landing-final-cta__buttons">
          {/* Pulsing wrapper around primary CTA — demonstrates Peak-End */}
          <div className="landing-final-cta__pulse-wrapper" aria-hidden="true">
            <div className="landing-final-cta__pulse-ring" />
          </div>
          <button
            className="btn-primary landing-final-cta__primary"
            onClick={() => navigate('/create')}
            aria-label="Create a new StreamHub group"
          >
            Create a Group <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/join')}
            aria-label="Join an existing group with an invite code"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            Join with a Code
          </button>
        </div>
      </motion.div>
    </section>
  );
}
