import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function PingModal({ isOpen, onClose, targetSlot, targetUser = "Aarav" }) {
  const { socket } = useSocket();
  const [secondsLeft, setSecondsLeft] = useState(120);
  const totalSeconds = 120;

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(120);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  // Auto-close if slot_updated indicates target slot was freed
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleSlotUpdate = (data) => {
      if (targetSlot) {
        const slot = data.slots?.find((s) => s.slotNumber === targetSlot.slotNumber);
        if (slot && slot.memberId === null) {
          onClose();
        }
      }
    };

    socket.on('slot_updated', handleSlotUpdate);
    return () => socket.off('slot_updated', handleSlotUpdate);
  }, [socket, isOpen, targetSlot, onClose]);

  if (!isOpen) return null;

  // Format mm:ss
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

  // SVG circular countdown calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / totalSeconds) * circumference;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 6, 10, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#131622',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        width: '380px',
        maxWidth: '100%',
        padding: '28px 24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        {/* Bell Icon in Purple circle */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-purple-light)',
          marginBottom: '20px'
        }}>
          <Bell size={22} fill="var(--accent-purple-light)" />
        </div>

        {/* SVG Circular Countdown */}
        <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '20px' }}>
          <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="#212638"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="url(#countdownGrad)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Center */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#FFFFFF'
          }}>
            {formattedTime}
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Ping Sent!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '14px' }}>
          Waiting for a response...
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '24px' }}>
          If there's no response in 2 minutes, {targetUser}'s slot will be released automatically.
        </p>

        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-full)' }}
        >
          Cancel Ping
        </button>
      </div>
    </div>
  );
}
