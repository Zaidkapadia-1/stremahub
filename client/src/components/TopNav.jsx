import React from 'react';
import { Search, Bell } from 'lucide-react';


export default function TopNav({ onSearch }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '28px',
      flexWrap: 'wrap'
    }}>
      {/* Search Bar */}
      <div style={{
        position: 'relative',
        width: '340px',
        maxWidth: '100%'
      }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
        <input
          type="text"
          placeholder="Search accounts..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="input-field"
          style={{
            paddingLeft: '40px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            fontSize: '0.88rem'
          }}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn-icon"
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%'
          }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </div>
  );
}