import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TopNav({ onSearch }) {
  const { groupId } = useParams();
  const navigate = useNavigate();

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
          onClick={() => navigate(`/group/${groupId}/add-accounts`)}
          className="btn-primary"
          style={{ fontSize: '0.88rem', padding: '9px 18px' }}
        >
          <Plus size={16} />
          <span>Add Account</span>
        </button>

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
