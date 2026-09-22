import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];

/* ──────────────────────────────────────────────
   Static slot rows used inside each service panel
   ────────────────────────────────────────────── */
function SlotRow({ user, status }) {
  const isWatching  = status === 'watching';
  const isClaiming  = status === 'claiming';
  const isAvailable = status === 'available';

  return (
    <div className="ldemo__slot-row">
      <span
        className={`ldemo__dot ${
          isWatching  ? 'ldemo__dot--watching'  :
          isClaiming  ? 'ldemo__dot--claiming'  :
          'ldemo__dot--empty'
        }`}
        aria-hidden="true"
      />
      <span className={`ldemo__slot-user ${isAvailable ? 'ldemo__slot-user--empty' : ''}`}>
        {user}
      </span>
      {isWatching && (
        <span className="ldemo__slot-badge ldemo__slot-badge--watching">Watching</span>
      )}
      {isClaiming && (
        <span className="ldemo__slot-badge ldemo__slot-badge--claiming">Claiming</span>
      )}
      {isAvailable && (
        <button className="ldemo__claim-btn" tabIndex={-1} aria-hidden="true">
          Claim slot
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   A single service panel (Netflix / Prime / Disney+)
   ────────────────────────────────────────────── */
function ServicePanel({ service, color, slots, badge, delay }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="ldemo__panel"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.6, ease }}
      style={{ '--svc-color': color }}
    >
      <div className="ldemo__panel-header">
        <div className="ldemo__panel-service">
          <span className="ldemo__panel-dot" style={{ background: color }} aria-hidden="true" />
          <span className="ldemo__panel-name">{service}</span>
        </div>
        <span className="ldemo__slot-count">{slots.length} slots</span>
      </div>

      {badge && (
        <div className={`ldemo__banner ldemo__banner--${badge.type}`}>
          {badge.text}
        </div>
      )}

      <div className="ldemo__slots">
        {slots.map((slot, i) => (
          <SlotRow key={i} {...slot} />
        ))}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Main section
   ────────────────────────────────────────────── */
const PANELS = [
  {
    service: 'Netflix',
    color: '#E50914',
    delay: 0.05,
    slots: [
      { user: 'Aarav',     status: 'watching' },
      { user: 'Available', status: 'available' },
    ],
    badge: null,
  },
  {
    service: 'Prime Video',
    color: '#00A8E1',
    delay: 0.18,
    slots: [
      { user: 'Priya',   status: 'watching' },
      { user: 'Rahul',   status: 'watching' },
    ],
    badge: { type: 'full', text: '⚠ All 2 slots occupied · Ping a viewer' },
  },
  {
    service: 'Disney+',
    color: '#113CCF',
    delay: 0.31,
    slots: [
      { user: 'Available', status: 'available' },
      { user: 'Available', status: 'available' },
    ],
    badge: null,
  },
];

export default function LiveDemoSection() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="live-demo"
      className="landing-ldemo"
      aria-labelledby="ldemo-heading"
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          The dashboard
        </motion.p>
        <motion.h2
          id="ldemo-heading"
          className="landing-section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1, duration: 0.55, ease }}
        >
          Three accounts. One view.<br />No conversation required.
        </motion.h2>
        <motion.p
          className="landing-section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your group's shared streaming accounts — slot by slot, live.
          See what's available the moment you open the app.
        </motion.p>
      </div>

      {/* Panels grid */}
      <div className="ldemo__grid">
        {PANELS.map((panel) => (
          <ServicePanel key={panel.service} {...panel} />
        ))}
      </div>

      {/* Context note */}
      <motion.p
        className="ldemo__note"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        Every slot state updates in real time — claim, release, or ping directly from this view.
      </motion.p>
    </section>
  );
}
