import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   ServiceLogo — shows the real brand logo via Simple Icons CDN
   https://simpleicons.org  (free, no-auth, returns SVG)

   Format: https://cdn.simpleicons.org/<slug>/<hex-color>
───────────────────────────────────────────────────────────── */

const SERVICE_META = {
  'netflix':          { slug: 'netflix',             bg: '#E50914', fg: 'ffffff' },
  'prime video':      { slug: 'amazonprimevideo',    bg: '#00A8E1', fg: 'ffffff' },
  'amazon prime':     { slug: 'amazonprimevideo',    bg: '#00A8E1', fg: 'ffffff' },
  'disney+':          { slug: 'disney',              bg: '#006E99', fg: 'ffffff' },
  'disney plus':      { slug: 'disney',              bg: '#006E99', fg: 'ffffff' },
  'youtube premium':  { slug: 'youtube',             bg: '#FF0000', fg: 'ffffff' },
  'youtube':          { slug: 'youtube',             bg: '#FF0000', fg: 'ffffff' },
  'hbo max':          { slug: 'hbomax',              bg: '#5822B4', fg: 'ffffff' },
  'max':              { slug: 'hbomax',              bg: '#5822B4', fg: 'ffffff' },
  'hbo':              { slug: 'hbomax',              bg: '#5822B4', fg: 'ffffff' },
  'apple tv+':        { slug: 'appletv',             bg: '#1c1c1e', fg: 'ffffff' },
  'apple tv':         { slug: 'appletv',             bg: '#1c1c1e', fg: 'ffffff' },
  'spotify':          { slug: 'spotify',             bg: '#1DB954', fg: 'ffffff' },
  'paramount+':       { slug: 'paramount',           bg: '#0064FF', fg: 'ffffff' },
  'paramount plus':   { slug: 'paramount',           bg: '#0064FF', fg: 'ffffff' },
  'jio cinema':       { slug: 'jio',                bg: '#003087', fg: 'ffffff' },
  'hotstar':          { slug: 'hotstar',             bg: '#1f80e0', fg: 'ffffff' },
  'zee5':             { slug: 'zee5',               bg: '#9b1fe8', fg: 'ffffff' },
  'crunchyroll':      { slug: 'crunchyroll',        bg: '#F47521', fg: 'ffffff' },
  'peacock':          { slug: 'peacocktv',          bg: '#000000', fg: 'ffffff' },
};

export function getServiceColor(name = '') {
  const meta = SERVICE_META[name.toLowerCase().trim()];
  return meta?.bg || '#7c3aed';
}

/* Fallback: coloured square with the first letter */
function FallbackLogo({ name, size, radius }) {
  const bg = getServiceColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.44, color: '#fff',
      boxShadow: `0 4px 16px ${bg}55`,
      userSelect: 'none'
    }}>
      {(name || 'S').charAt(0).toUpperCase()}
    </div>
  );
}

export default function ServiceLogo({ name = '', size = 52 }) {
  const key  = name.toLowerCase().trim();
  const meta = SERVICE_META[key];
  const radius = Math.round(size * 0.27);         // ~14px at 52px
  const imgSize = Math.round(size * 0.58);        // icon is 58% of container
  const [imgErr, setImgErr] = useState(false);

  if (!meta || imgErr) {
    return <FallbackLogo name={name} size={size} radius={radius} />;
  }

  const logoUrl = `https://cdn.simpleicons.org/${meta.slug}/${meta.fg}`;

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: meta.bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px ${meta.bg}66`,
      overflow: 'hidden'
    }}>
      <img
        src={logoUrl}
        alt={name}
        width={imgSize}
        height={imgSize}
        style={{ objectFit: 'contain', display: 'block' }}
        onError={() => setImgErr(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
