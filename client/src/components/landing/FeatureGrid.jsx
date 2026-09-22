import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Tv2, Bell, Activity, MessageSquare, Shield,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    icon: Tv2,
    color: '#38BDF8',
    title: 'Live slot availability',
    desc: 'See how many slots exist and which ones are currently occupied — in real time, for every shared account your group manages.',
  },
  {
    icon: Shield,
    color: '#8B5CF6',
    title: 'Claim your slot',
    desc: 'Take an available slot when you want to watch. The reservation is temporary so stale sessions do not block everyone else.',
  },
  {
    icon: Activity,
    color: '#34D399',
    title: "Release when you're done",
    desc: 'Give your slot back when you finish instead of leaving the group guessing whether a stream is still running.',
  },
  {
    icon: Bell,
    color: '#F87171',
    title: "Ping when it's full",
    desc: 'When every slot is occupied, send a reminder to the current viewer. A ping shortens the active slot window to two minutes.',
  },
  {
    icon: Activity,
    color: '#A855F7',
    title: 'Activity history',
    desc: 'See joins, claims, releases, account additions and pings in one timeline. Nothing gets lost in a separate group chat.',
  },
  {
    icon: MessageSquare,
    color: '#34D399',
    title: 'Group coordination',
    desc: 'Keep conversation, members and shared accounts in the same group instead of splitting everything across separate chats.',
  },
];

export function FeatureCard({ icon: Icon, color, title, desc, delay = 0 }) {
  const shouldReduce = useReducedMotion();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, visible: false });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
      visible: true,
    });
  }

  return (
    <motion.div
      className="landing-feature-card"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.55, ease }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight(s => ({ ...s, visible: false }))}
      whileHover={shouldReduce ? {} : { y: -4 }}
      style={{
        '--spotlight-x': `${spotlight.x}%`,
        '--spotlight-y': `${spotlight.y}%`,
        '--spotlight-opacity': spotlight.visible ? 1 : 0,
        '--feature-color': color,
      }}
    >
      <div className="landing-feature-card__spotlight" aria-hidden="true" />

      <motion.div
        className="landing-feature-card__icon"
        whileHover={shouldReduce ? {} : { y: -2 }}
        transition={{ duration: 0.2 }}
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}
      >
        <Icon size={22} color={color} aria-hidden="true" />
      </motion.div>

      <h3 className="landing-feature-card__title">{title}</h3>
      <p  className="landing-feature-card__desc">{desc}</p>
    </motion.div>
  );
}

export default function FeatureGrid() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="features"
      className="landing-features"
      aria-labelledby="features-heading"
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          Features
        </motion.p>
        <motion.h2
          id="features-heading"
          className="landing-section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1, duration: 0.55, ease }}
        >
          Everything the group needs to coordinate a shared account
        </motion.h2>
        <motion.p
          className="landing-section-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          StreamHub keeps the current state visible so the group does not have
          to keep asking for it.
        </motion.p>
      </div>

      <div className="landing-feature-grid">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} {...f} delay={i * 0.07} />
        ))}
      </div>
    </section>
  );
}
