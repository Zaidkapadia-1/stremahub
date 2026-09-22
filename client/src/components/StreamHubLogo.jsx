import React, { useEffect, useState } from 'react';

/**
 * StreamHubLogo
 * Unified logo mark across public and internal surfaces:
 * central play shape + subtle surrounding orbit ring + 3 connected member dots (with 1 live mint point) + purple gradient glow.
 *
 * Props:
 *   size        — overall mark size in px (default 36)
 *   showWord    — show "StreamHub" wordmark beside mark (default true)
 *   wordSize    — wordmark font size (default "1.25rem")
 *   animate     — run entrance animation (default false for instant UI, true on landing)
 *   onClick     — optional click handler
 */
export default function StreamHubLogo({
  size = 36,
  showWord = true,
  wordSize = '1.25rem',
  animate = false,
  onClick
}) {
  const [phase, setPhase] = useState(animate ? 0 : 4);

  useEffect(() => {
    if (!animate) {
      setPhase(4);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 60),
      setTimeout(() => setPhase(2), 240),
      setTimeout(() => setPhase(3), 420),
      setTimeout(() => setPhase(4), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42;

  // Connected member points on the orbit ring
  const dots = [
    { angle: 45,  color: '#34D399' }, // mint — "live" connected point
    { angle: 165, color: '#8B5CF6' }, // purple
    { angle: 285, color: '#94A3B8' }, // slate / connected user
  ];

  function dotPos(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(6, Math.round(s * 0.26))}px`,
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none'
      }}
      aria-label="StreamHub"
    >
      {/* ── SVG Mark ── */}
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={`shGrad-${s}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </radialGradient>
          <filter id={`shGlow-${s}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={s * 0.08} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit ring representing the hub */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(139,92,246,0.38)"
          strokeWidth="1.2"
          strokeDasharray={`${s * 0.15} ${s * 0.06}`}
          fill="none"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={s * 0.28}
          fill={`url(#shGrad-${s})`}
          filter={`url(#shGlow-${s})`}
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: `scale(${phase >= 2 ? 1 : 0.6})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'opacity 0.22s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />

        {/* Play triangle */}
        <polygon
          points={`${cx - s * 0.09},${cy - s * 0.12} ${cx + s * 0.13},${cy} ${cx - s * 0.09},${cy + s * 0.12}`}
          fill="#FFFFFF"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transition: 'opacity 0.18s ease 0.05s',
          }}
        />

        {/* Connected points */}
        {dots.map((d, i) => {
          const pos = dotPos(d.angle);
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={s * 0.065}
              fill={d.color}
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transition: `opacity 0.2s ease ${0.05 * i}s`,
              }}
            />
          );
        })}
      </svg>

      {/* ── Wordmark ── */}
      {showWord && (
        <span
          style={{
            fontSize: wordSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#F8FAFC',
            opacity: phase >= 4 ? 1 : 0,
            transform: `translateY(${phase >= 4 ? 0 : 4}px)`,
            transition: 'opacity 0.24s ease, transform 0.24s ease',
            userSelect: 'none',
            lineHeight: 1
          }}
        >
          StreamHub
        </span>
      )}
    </div>
  );
}
