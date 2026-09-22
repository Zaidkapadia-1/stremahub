import React from 'react';
import { Search } from 'lucide-react';

/**
 * TopNav — compact page header with optional search.
 * Props:
 *   title    string  — page heading (e.g. "Streaming Accounts")
 *   subtitle string  — optional subtext
 *   onSearch fn      — if provided, renders a compact search input
 *   actions  node    — optional right-side action buttons
 */
export default function TopNav({ title, subtitle, onSearch, actions }) {
  return (
    <div className="topnav">
      {/* Left: page context */}
      <div className="topnav__left">
        {title && <h1 className="topnav__title">{title}</h1>}
        {subtitle && <p className="topnav__sub">{subtitle}</p>}
      </div>

      {/* Right: search + actions */}
      <div className="topnav__right">
        {onSearch && (
          <div className="topnav__search">
            <Search size={14} color="var(--text-muted)" className="topnav__search-icon" />
            <input
              type="text"
              placeholder="Search accounts…"
              onChange={(e) => onSearch(e.target.value)}
              className="input-field"
              aria-label="Search accounts"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}