import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];

/* ── Principle card visuals (all aria-hidden, decorative only) ── */

function FittsVisual() {
  return (
    <div className="ldp-visual ldp-visual--fitts" aria-hidden="true">
      <button className="ldp-fitts__big">Claim slot</button>
      <div className="ldp-fitts__small-row">
        <button className="ldp-fitts__small">Share</button>
        <button className="ldp-fitts__small">Info</button>
      </div>
    </div>
  );
}

function HickVisual() {
  return (
    <div className="ldp-visual" aria-hidden="true">
      <div className="ldp-hick__choices">
        <button className="btn-primary ldp-hick__primary">Create a Group</button>
        <button className="btn-secondary ldp-hick__secondary">Join with a Code</button>
      </div>
      <p className="ldp-hick__label">Two choices. No paralysis.</p>
    </div>
  );
}

function RecognitionVisual() {
  return (
    <div className="ldp-visual ldp-visual--recognition" aria-hidden="true">
      <div className="ldp-recog__service">Netflix</div>
      <div className="ldp-recog__slot">
        <span className="lp-preview__dot lp-preview__dot--watching" />
        <span>1 Watching</span>
      </div>
      <div className="ldp-recog__slot">
        <span className="lp-preview__dot lp-preview__dot--empty" />
        <span>1 Available</span>
      </div>
    </div>
  );
}

function VonRestorffVisual() {
  return (
    <div className="ldp-visual ldp-visual--vr" aria-hidden="true">
      <div className="ldp-vr__row">
        <button className="ldp-vr__neutral">Members</button>
        <button className="ldp-vr__neutral">Activity</button>
        <button className="ldp-vr__neutral">Settings</button>
        <button className="ldp-vr__primary btn-primary">Claim slot</button>
      </div>
    </div>
  );
}

function PeakEndVisual() {
  const [claimed, setClaimed] = useState(false);
  const shouldReduce = useReducedMotion();

  return (
    <div className="ldp-visual ldp-visual--peak" aria-hidden="true">
      {!claimed ? (
        <button
          className="btn-primary ldp-peak__btn"
          onClick={() => setClaimed(true)}
          tabIndex={-1}
        >
          Claim slot
        </button>
      ) : (
        <motion.div
          className="ldp-peak__success"
          initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          onAnimationComplete={() => setTimeout(() => setClaimed(false), 1800)}
        >
          <Check size={18} aria-hidden="true" />
          <span>Slot claimed</span>
        </motion.div>
      )}
      <p className="ldp-peak__hint">Click to see</p>
    </div>
  );
}

function AestheticVisual() {
  return (
    <div className="ldp-visual ldp-visual--aesthetic" aria-hidden="true">
      <div className="ldp-aes__mini">
        <div className="ldp-aes__header">
          <span className="ldp-aes__dot" style={{ background: '#34D399' }} />
          <span style={{ fontSize: '0.7rem', color: '#A5ACC0' }}>Netflix · 2 slots</span>
        </div>
        <div className="ldp-aes__row">
          <span className="lp-preview__dot lp-preview__dot--watching" />
          <span style={{ fontSize: '0.72rem', color: '#F8FAFC' }}>Aarav</span>
          <span style={{ fontSize: '0.68rem', color: '#34D399', marginLeft: 'auto' }}>Watching</span>
        </div>
        <div className="ldp-aes__row">
          <span className="lp-preview__dot lp-preview__dot--empty" />
          <span style={{ fontSize: '0.72rem', color: '#656D86' }}>Available</span>
          <span style={{ fontSize: '0.68rem', color: '#8B5CF6', marginLeft: 'auto' }}>Claim →</span>
        </div>
      </div>
    </div>
  );
}

const PRINCIPLES = [
  { law: "Fitts's Law",               content: 'The most important action is the easiest one to reach.',                          Visual: FittsVisual },
  { law: "Hick's Law",                content: 'The first screen should not make users choose from ten directions.',               Visual: HickVisual },
  { law: 'Recognition over recall',   content: 'Users should see availability instead of remembering who is watching.',            Visual: RecognitionVisual },
  { law: 'Von Restorff Effect',        content: 'The primary action stands apart from supporting actions.',                         Visual: VonRestorffVisual },
  { law: 'Peak-End Rule',              content: 'Important moments should feel clear and satisfying.',                              Visual: PeakEndVisual },
  { law: 'Aesthetic-Usability Effect', content: 'A clear visual system makes the interface easier to understand and trust.',       Visual: AestheticVisual },
];

function PrincipleCard({ law, content, Visual, delay }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.article
      className="landing-principle-card"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.55, ease }}
      whileHover={shouldReduce ? {} : { y: -3 }}
    >
      <div className="landing-principle-card__visual">
        <Visual />
      </div>
      <div className="landing-principle-card__body">
        <h3 className="landing-principle-card__law">{law}</h3>
        <p  className="landing-principle-card__content">{content}</p>
      </div>
    </motion.article>
  );
}

export default function DesignPrinciples() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="design-logic"
      className="landing-principles"
      aria-labelledby="principles-heading"
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          Design logic
        </motion.p>
        <motion.h2
          id="principles-heading"
          className="landing-section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1, duration: 0.55, ease }}
        >
          Designed around how people actually decide.
        </motion.h2>
        <motion.p
          className="landing-section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          StreamHub is built to reduce the small decisions and repeated
          questions that make shared accounts frustrating.
        </motion.p>
      </div>

      <div className="landing-principle-grid">
        {PRINCIPLES.map((p, i) => (
          <PrincipleCard key={p.law} {...p} delay={i * 0.07} />
        ))}
      </div>
    </section>
  );
}
