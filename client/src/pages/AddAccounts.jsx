import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, Check, Minus } from 'lucide-react';
import api from '../api';
import { useUser } from '../context/UserContext';
import StepProgress from '../components/StepProgress';
import ServiceLogo from '../components/ServiceLogo';

const defaultServices = [
  { name: 'Netflix',          defaultSlots: 2 },
  { name: 'Prime Video',      defaultSlots: 3 },
  { name: 'Disney+',          defaultSlots: 4 },
  { name: 'YouTube Premium',  defaultSlots: 2 },
  { name: 'HBO Max',          defaultSlots: 2 },
  { name: 'Apple TV+',        defaultSlots: 2 },
];

export default function AddAccounts() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('from') === 'create';

  const [selectedServices, setSelectedServices] = useState({});
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customServices, setCustomServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (name) => {
    setSelectedServices((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      const svc = defaultServices.find((d) => d.name === name) || { defaultSlots: 2 };
      return { ...prev, [name]: svc.defaultSlots };
    });
  };

  const adjustSlots = (name, delta) => {
    setSelectedServices((prev) => {
      const cur = prev[name] || 2;
      const next = Math.max(1, Math.min(10, cur + delta));
      return { ...prev, [name]: next };
    });
  };

  const addCustomService = () => {
    const name = customInput.trim();
    if (!name) return;
    if (!customServices.includes(name)) setCustomServices((p) => [...p, name]);
    setSelectedServices((prev) => ({ ...prev, [name]: 2 }));
    setCustomInput('');
    setShowCustom(false);
  };

  const allServices = [
    ...defaultServices,
    ...customServices.map((n) => ({ name: n, defaultSlots: 2, bg: null, emoji: '🎞️' }))
  ];

  const handleFinish = async () => {
    if (Object.keys(selectedServices).length === 0) {
      setError('Choose at least one service, or click Skip.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      for (const [sName, slots] of Object.entries(selectedServices)) {
        await api.post(`/group/${groupId}/account`, {
          requesterId: user?.memberId,
          serviceName: sName,
          totalSlots: slots
        });
      }
      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceStyle = (svc) => {
    if (!svc.bg) return 'linear-gradient(135deg, #7c3aed, #a855f7)';
    return svc.bg;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '36px 48px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        {isOnboarding && <StepProgress currentStep={3} />}
        {!isOnboarding && <span className="eyebrow">GROUP LIBRARY</span>}
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }} className="animate-fade-in-up">
        {isOnboarding && <span className="eyebrow">STEP 3 OF 3</span>}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '10px 0 8px' }}>
          {isOnboarding ? 'Add Streaming Accounts' : 'Manage Accounts'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '36px', lineHeight: 1.5 }}>
          Select the services your group shares. You can set how many slots each has.
        </p>

        {error && (
          <p role="alert" style={{ color: '#fda4af', marginBottom: '18px', fontSize: '0.9rem' }}>{error}</p>
        )}

        {/* Service Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '40px' }}>
          {allServices.map((svc) => {
            const isSelected = !!selectedServices[svc.name];
            const slots = selectedServices[svc.name];
            return (
              <div
                key={svc.name}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))'
                    : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 20px rgba(139,92,246,0.25)' : 'none'
                }}
                onClick={() => toggleService(svc.name)}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'var(--accent-grad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'checkPop 0.3s ease'
                  }}>
                    <Check size={13} color="#fff" />
                  </div>
                )}

                <ServiceLogo name={svc.name} size={52} />

                <span style={{ fontSize: '0.92rem', fontWeight: 700, textAlign: 'center' }}>{svc.name}</span>

                {/* Slot stepper */}
                {isSelected ? (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => adjustSlots(svc.name, -1)}
                      className="btn-icon"
                      style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', padding: 0 }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                      {slots} slot{slots > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => adjustSlots(svc.name, 1)}
                      className="btn-icon"
                      style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', padding: 0 }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{svc.defaultSlots} slots default</span>
                )}
              </div>
            );
          })}

          {/* Add Custom Tile */}
          {showCustom ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--accent-purple)',
              borderRadius: 'var(--radius-md)', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <input
                autoFocus
                className="input-field"
                placeholder="e.g. Paramount+"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addCustomService(); if (e.key === 'Escape') setShowCustom(false); }}
                style={{ padding: '8px 12px', fontSize: '0.88rem' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addCustomService} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>Add</button>
                <button onClick={() => setShowCustom(false)} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowCustom(true)}
              style={{
                background: 'var(--bg-card)', border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '20px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '10px', cursor: 'pointer',
                transition: 'border-color 0.15s',
                minHeight: '130px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Plus size={22} />
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Other Service</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Skip for now
          </button>
          <button
            onClick={handleFinish}
            disabled={loading || Object.keys(selectedServices).length === 0}
            className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '0.95rem' }}
          >
            {loading ? 'Saving...' : isOnboarding ? 'Finish Setup 🎉' : 'Save Accounts →'}
          </button>
        </div>
      </div>
    </div>
  );
}
