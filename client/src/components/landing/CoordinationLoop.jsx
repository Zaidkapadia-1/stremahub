import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/**
 * CoordinationLoop — animated state machine diagram.
 * Two paths:
 *   Normal: AVAILABLE → CLAIMED → WATCHING → RELEASED → AVAILABLE
 *   Ping:   FULL → PING → 2 MIN WINDOW → RELEASED
 */

const NORMAL_STATES = [
  { id: 'available', label: 'AVAILABLE', color: '#34D399', desc: 'Slot is free for any member to take' },
  { id: 'claimed', label: 'CLAIMED', color: '#38BDF8', desc: 'A member has reserved the slot' },
  { id: 'watching', label: 'WATCHING', color: '#8B5CF6', desc: 'Slot is active — 2 hour window' },
  { id: 'released', label: 'RELEASED', color: '#A5ACC0', desc: 'Member released the slot' },
];

const PING_STATES = [
  { id: 'full', label: 'ALL FULL', color: '#F87171', desc: 'Every slot is occupied' },
  { id: 'ping', label: 'PING SENT', color: '#FBBF24', desc: 'Reminder sent to current viewer' },
  { id: 'window', label: '2 MIN WINDOW', color: '#FB923C', desc: 'Slot lifetime shortened to 2 minutes' },
  { id: 'free', label: 'RELEASED', color: '#34D399', desc: 'Slot freed for next member' },
];

function StateBubble({ state, isActive, shouldReduce }) {
  return (
    <motion.div
      className="landing-loop__bubble"
      animate={isActive ? {
        borderColor: state.color,
        boxShadow: shouldReduce ? 'none' : `0 0 18px ${state.color}55`,
        scale: shouldReduce ? 1 : 1.04,
      } : {
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: 'none',
        scale: 1,
      }}
      transition={{ duration: 0.35 }}
      aria-current={isActive ? 'step' : undefined}
    >
      <span
        className="landing-loop__bubble-dot"
        style={{ background: state.color, opacity: isActive ? 1 : 0.3 }}
        aria-hidden="true"
      />
      <span className="landing-loop__bubble-label" style={{ color: isActive ? '#F8FAFC' : '#656D86' }}>
        {state.label}
      </span>
      {isActive && (
        <span className="landing-loop__bubble-desc">{state.desc}</span>
      )}
    </motion.div>
  );
}

function Arrow({ active }) {
  return (
    <div className={`landing-loop__arrow ${active ? 'landing-loop__arrow--active' : ''}`} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function CoordinationLoop() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-80px' });
  const shouldReduce = useReducedMotion();

  const [normalStep, setNormalStep] = useState(0);
  const [pingStep, setPingStep] = useState(0);

  useEffect(() => {
    if (!inView || shouldReduce) return;

    let ns = 0;
    let ps = 0;
    const interval = setInterval(() => {
      ns = (ns + 1) % NORMAL_STATES.length;
      ps = (ps + 1) % PING_STATES.length;
      setNormalStep(ns);
      setPingStep(ps);
    }, 1800);

    return () => clearInterval(interval);
  }, [inView, shouldReduce]);

  const sectionInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id="coordination-loop"
      className="landing-loop"
      aria-labelledby="loop-heading"
      ref={ref}
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          animate={sectionInView ? { opacity: 1 } : {}}
        >
          Product logic
        </motion.p>
        <motion.h2
          id="loop-heading"
          className="landing-section-title"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 14 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.08, duration: 0.5 }}
        >
          See the coordination loop
        </motion.h2>
        <motion.p
          className="landing-section-sub"
          initial={{ opacity: 0 }}
          animate={sectionInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.16 }}
        >
          Every action in StreamHub follows one of these two paths.
        </motion.p>
      </div>

      <div className="landing-loop__paths">
        {/* Normal path */}
        <div className="landing-loop__path" aria-label="Normal slot lifecycle">
          <p className="landing-loop__path-label">Normal lifecycle</p>
          <div className="landing-loop__chain">
            {NORMAL_STATES.map((state, i) => (
              <React.Fragment key={state.id}>
                <StateBubble state={state} isActive={i === normalStep} shouldReduce={shouldReduce} />
                {i < NORMAL_STATES.length - 1 && <Arrow active={i === normalStep} />}
              </React.Fragment>
            ))}
            {/* Loop arrow back to start */}
            <Arrow active={normalStep === NORMAL_STATES.length - 1} />
          </div>
        </div>

        {/* Ping path */}
        <div className="landing-loop__path" aria-label="Ping path when all slots are full">
          <p className="landing-loop__path-label">When all slots are full</p>
          <div className="landing-loop__chain">
            {PING_STATES.map((state, i) => (
              <React.Fragment key={state.id}>
                <StateBubble state={state} isActive={i === pingStep} shouldReduce={shouldReduce} />
                {i < PING_STATES.length - 1 && <Arrow active={i === pingStep} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
