import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1];

const STEPS = [
  { n: '01', title: 'Create a group',              desc: 'Give your group a name and get a private invite code.' },
  { n: '02', title: 'Invite the group',             desc: 'Share the code so people can join the same shared space.' },
  { n: '03', title: 'Add the services',             desc: 'Add Netflix, Prime Video, Disney+ or another shared service and define its available slots.' },
  { n: '04', title: 'Claim before watching',        desc: 'Everyone can see which slots are available before starting.' },
  { n: '05', title: 'Release when finished',        desc: 'Your slot becomes available to the group again.' },
  { n: '06', title: 'Ping when every slot is taken', desc: 'Send a reminder to a current viewer instead of starting another group-chat argument.' },
];

export default function HowItWorks() {
  const shouldReduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(-1);
  const triggered = useRef(false);

  function onViewEnter() {
    if (triggered.current) return;
    triggered.current = true;
    STEPS.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), 600 + i * 500);
    });
  }

  return (
    <section
      id="how-it-works"
      className="landing-hiw"
      aria-labelledby="hiw-heading"
    >
      <div className="landing-section-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.p>
        <motion.h2
          id="hiw-heading"
          className="landing-section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          From "Who's watching?"<br />to "Just press play."
        </motion.h2>
      </div>

      <div className="landing-hiw__timeline" aria-label="Six-step process">
        {/* Progress track */}
        <div className="landing-hiw__track" aria-hidden="true">
          <motion.div
            className="landing-hiw__track-fill"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.5, duration: shouldReduce ? 0.01 : 2.5, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
            onViewportEnter={onViewEnter}
          />
        </div>

        <div className="landing-hiw__steps">
          {STEPS.map((step, i) => {
            const isActive = i <= activeStep;
            return (
              <motion.div
                key={step.n}
                className={`landing-hiw__step ${isActive ? 'landing-hiw__step--active' : ''}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              >
                <div className="landing-hiw__step-node" aria-hidden="true">
                  <span className="landing-hiw__step-num">{step.n}</span>
                </div>
                <div className="landing-hiw__step-body">
                  <h3 className="landing-hiw__step-title">{step.title}</h3>
                  <p  className="landing-hiw__step-desc">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
