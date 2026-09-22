import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Play, RotateCcw } from 'lucide-react';

export default function HeroLivePreview() {
  // Mode: 'normal' (Slot 1: Alex, Slot 2: Available or Claimed) | 'full' (Slot 1: Alex, Slot 2: Jordan)
  const [isFullSim, setIsFullSim] = useState(false);
  const [claimedByYou, setClaimedByYou] = useState(false);
  const [pingSent, setPingSent] = useState(false);
  const [slot1Seconds, setSlot1Seconds] = useState(5062); // ~1h 24m 22s
  const [yourSeconds, setYourSeconds] = useState(7200);   // 2h

  // Gentle 1s tick for active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setSlot1Seconds((s) => (s > 0 ? s - 1 : 7200));
      setYourSeconds((s) => (s > 0 ? s - 1 : 7200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClaim = () => {
    setClaimedByYou(true);
    setYourSeconds(7200);
    setPingSent(false);
  };

  const handleRelease = () => {
    setClaimedByYou(false);
    setPingSent(false);
  };

  const handlePing = () => {
    setPingSent(true);
    setTimeout(() => {
      setPingSent(false);
    }, 3800);
  };

  const handleToggleFull = () => {
    setIsFullSim((prev) => {
      const next = !prev;
      if (next) setClaimedByYou(false);
      setPingSent(false);
      return next;
    });
  };

  return (
    <div
      className="lp-preview"
      style={{
        width: '100%',
        maxWidth: '430px',
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)'
      }}
      aria-label="Interactive preview of StreamHub slot availability"
    >
      {/* Header */}
      <div className="lp-preview__header">
        <div className="lp-preview__service" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #E50914, #B81D24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.85rem'
          }}>
            N
          </div>
          <span className="lp-preview__service-name" style={{ fontSize: '1rem', fontWeight: 700 }}>Netflix</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>4K Premium</span>
        </div>
        <div className="lp-preview__live-badge">
          <span className="lp-preview__live-dot" aria-hidden="true" />
          LIVE SYNC
        </div>
      </div>

      {/* Dynamic Status Notification Banner */}
      {pingSent ? (
        <div className="lp-preview__banner lp-preview__banner--ping animate-fade-in" style={{ gap: '6px' }}>
          <Bell size={13} />
          <span>Ping sent to Alex! Slot expiry shortened to 2 min.</span>
        </div>
      ) : isFullSim ? (
        <div className="lp-preview__banner lp-preview__banner--full animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All 2 slots occupied</span>
          <button
            onClick={handlePing}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bell size={11} />
            Ping Alex
          </button>
        </div>
      ) : claimedByYou ? (
        <div className="lp-preview__banner lp-preview__banner--released animate-fade-in" style={{ gap: '6px' }}>
          <Check size={13} />
          <span>You are watching Netflix (Slot 2 reserved)</span>
        </div>
      ) : null}

      {/* Slots List */}
      <div className="lp-preview__slots">

        {/* Slot 1 — Alex watching */}
        <div className="lp-preview__slot lp-preview__slot--active" style={{ transition: 'all 0.25s ease' }}>
          <div className="lp-preview__slot-header">
            <span className="lp-preview__slot-label">SLOT 1</span>
            <span className="lp-preview__slot-timer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} />
              {formatTimer(slot1Seconds)}
            </span>
          </div>
          <div className="lp-preview__slot-body" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="lp-preview__dot lp-preview__dot--watching" aria-hidden="true" />
              <span className="lp-preview__slot-user">Alex</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(52, 211, 153, 0.1)',
                color: '#34D399',
                fontWeight: 600
              }}>
                Watching
              </span>
            </div>
            {isFullSim && !pingSent && (
              <button
                onClick={handlePing}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem'
                }}
                title="Ping Alex"
              >
                <Bell size={13} color="#F87171" />
              </button>
            )}
          </div>
        </div>

        {/* Slot 2 — Dynamic Interactive Slot */}
        {isFullSim ? (
          <div className="lp-preview__slot lp-preview__slot--active animate-fade-in">
            <div className="lp-preview__slot-header">
              <span className="lp-preview__slot-label">SLOT 2</span>
              <span className="lp-preview__slot-timer">00:41:18</span>
            </div>
            <div className="lp-preview__slot-body">
              <span className="lp-preview__dot lp-preview__dot--watching" aria-hidden="true" />
              <span className="lp-preview__slot-user">Jordan</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(52, 211, 153, 0.1)',
                color: '#34D399',
                fontWeight: 600
              }}>
                Watching
              </span>
            </div>
          </div>
        ) : claimedByYou ? (
          <div className="lp-preview__slot lp-preview__slot--active animate-fade-in" style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}>
            <div className="lp-preview__slot-header">
              <span className="lp-preview__slot-label" style={{ color: 'var(--accent-purple-light)' }}>SLOT 2 · YOUR SESSION</span>
              <span className="lp-preview__slot-timer" style={{ color: 'var(--accent-purple-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                {formatTimer(yourSeconds)}
              </span>
            </div>
            <div className="lp-preview__slot-body" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="lp-preview__dot lp-preview__dot--watching" aria-hidden="true" />
                <span className="lp-preview__slot-user" style={{ color: '#fff' }}>You</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#C084FC',
                  fontWeight: 600
                }}>
                  Active
                </span>
              </div>
              <button
                onClick={handleRelease}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                Release slot
              </button>
            </div>
          </div>
        ) : (
          <div className="lp-preview__slot animate-fade-in">
            <div className="lp-preview__slot-header">
              <span className="lp-preview__slot-label">SLOT 2</span>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>Free to claim</span>
            </div>
            <div className="lp-preview__slot-body" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="lp-preview__dot lp-preview__dot--empty" aria-hidden="true" />
                <span className="lp-preview__slot-user lp-preview__slot-user--empty">Available</span>
              </div>
              <button
                onClick={handleClaim}
                className="lp-preview__claim-btn"
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.25))',
                  border: '1px solid var(--accent-purple)',
                  color: '#E9D5FF'
                }}
              >
                Claim slot
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Simulation Controls Bar */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleToggleFull}
          style={{
            background: 'transparent',
            border: 'none',
            color: isFullSim ? '#F87171' : 'var(--accent-purple-light)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '2px 0',
            textDecoration: 'underline'
          }}
        >
          {isFullSim ? '← Back to 1 free slot' : 'Simulate: All slots full →'}
        </button>

        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Interactive Demo
        </span>
      </div>
    </div>
  );
}
