import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const BEFORE = [
  '"Who\'s using Netflix right now?"',
  '"Me, just started."',
  '"How long?"',
  '"Maybe 20 more mins idk"',
  '"Can you let me know when you\'re done?"',
  '"… sure"',
];

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  const itemVariant = {
    hidden: { opacity: 0, x: shouldReduce ? 0 : -12 },
    show: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
  };

  const afterVariant = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.96 },
    show: { opacity: 1, scale: 1, transition: { delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="problem"
      className="landing-problem"
      aria-labelledby="problem-heading"
      ref={ref}
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          The real friction
        </motion.p>
        <motion.h2
          id="problem-heading"
          className="landing-section-title"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          The problem isn't streaming.<br />
          It's coordination.
        </motion.h2>
        <motion.p
          className="landing-section-sub"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          When a shared account has limited slots, the hardest part is often
          finding out who is using them.
        </motion.p>
      </div>

      {/* Before ↔ After */}
      <div className="landing-problem__split">
        {/* BEFORE: chat messages */}
        <div className="landing-problem__before" aria-label="Before StreamHub: coordination through group chat">
          <p className="landing-problem__col-label">Before</p>
          <div className="landing-problem__chat">
            {BEFORE.map((msg, i) => (
              <motion.div
                key={i}
                className={`landing-problem__bubble ${i % 2 === 0 ? 'right' : 'left'}`}
                custom={i}
                variants={itemVariant}
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
              >
                {msg}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Arrow divider */}
        <div className="landing-problem__arrow" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 20h24M24 12l8 8-8 8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* AFTER: StreamHub panel */}
        <motion.div
          className="landing-problem__after"
          variants={afterVariant}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          aria-label="After StreamHub: live availability visible to all"
        >
          <p className="landing-problem__col-label">After</p>
          <div className="landing-problem__panel">
            <div className="landing-problem__panel-header">
              <span className="landing-problem__panel-service">Netflix</span>
              <span className="landing-problem__panel-slots">2 slots</span>
            </div>
            <div className="landing-problem__slot-row">
              <span className="lp-preview__dot lp-preview__dot--watching" aria-hidden="true" />
              <span className="landing-problem__slot-user">Aarav</span>
              <span className="landing-problem__slot-status watching">Watching</span>
            </div>
            <div className="landing-problem__slot-row">
              <span className="lp-preview__dot lp-preview__dot--empty" aria-hidden="true" />
              <span className="landing-problem__slot-user">Available</span>
              <button className="lp-preview__claim-btn" tabIndex={-1} aria-hidden="true">
                Claim slot
              </button>
            </div>
          </div>
          <p className="landing-problem__after-note">
            StreamHub turns that conversation into visible shared state.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
