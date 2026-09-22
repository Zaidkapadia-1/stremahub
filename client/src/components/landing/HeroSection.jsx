import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import HeroLivePreview from './HeroLivePreview';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const item = (shouldReduce) => ({
  hidden: { opacity: 0, y: shouldReduce ? 0 : 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
});

export default function HeroSection() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <section className="landing-hero" aria-labelledby="hero-heading">
      {/* Ambient spotlight — CSS animated, aria-hidden */}
      <div className="landing-hero__spotlight" aria-hidden="true">
        <div className="landing-hero__glow landing-hero__glow--purple" />
        <div className="landing-hero__glow landing-hero__glow--cyan" />
      </div>

      <div className="landing-hero__inner">
        {/* ── Left: copy ── */}
        <motion.div
          className="landing-hero__copy"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p
            className="landing-hero__eyebrow eyebrow"
            variants={item(shouldReduce)}
          >
            Shared streaming, without the group chat
          </motion.p>

          <motion.h1
            id="hero-heading"
            className="landing-hero__heading"
            variants={item(shouldReduce)}
          >
            Know the slot<br />
            <span className="grad-text">before you press play.</span>
          </motion.h1>

          <motion.p
            className="landing-hero__subtext"
            variants={item(shouldReduce)}
          >
            StreamHub gives your group one shared view of streaming
            availability. See who is watching, claim a free slot, release it
            when you're done, or ping a current viewer when everything is full.
          </motion.p>

          <motion.div
            className="landing-hero__ctas"
            variants={item(shouldReduce)}
          >
            <button
              className="btn-primary landing-hero__primary-cta"
              onClick={() => navigate('/create')}
              aria-label="Create a new streaming group"
            >
              Create a Group <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              className="btn-secondary landing-hero__secondary-cta"
              onClick={() => navigate('/join')}
              aria-label="Join an existing group with an invite code"
            >
              Join with a Code
            </button>
          </motion.div>

          <motion.p
            className="landing-hero__tagline"
            variants={item(shouldReduce)}
          >
            Set up a group. Add shared accounts. Let everyone see the same
            live availability.
          </motion.p>
        </motion.div>

        {/* ── Right: live preview ── */}
        <motion.div
          className="landing-hero__preview"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroLivePreview />
        </motion.div>
      </div>
    </section>
  );
}
