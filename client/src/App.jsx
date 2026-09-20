import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, NavLink } from 'react-router-dom';
import { Home, MessageSquare, Users, Settings as SettingsIcon } from 'lucide-react';
import { UserProvider, useUser } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';

import Landing from './pages/Landing';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import InviteMembers from './pages/InviteMembers';
import AddAccounts from './pages/AddAccounts';
import Dashboard from './pages/Dashboard';
import AccountDetail from './pages/AccountDetail';
import GroupChat from './pages/GroupChat';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Activity from './pages/Activity';

function MobileBottomNav() {
  const location = useLocation();
  const { user } = useUser();
  const groupId = user?.groupId;

  if (!groupId || location.pathname === '/' || location.pathname === '/create' || location.pathname.startsWith('/join')) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: `/group/${groupId}`, icon: Home },
    { name: 'Chat', path: `/group/${groupId}/chat`, icon: MessageSquare },
    { name: 'Members', path: `/group/${groupId}/members`, icon: Users },
    { name: 'Settings', path: `/group/${groupId}/settings`, icon: SettingsIcon },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CreateGroup />} />
            <Route path="/join/:code" element={<JoinGroup />} />
            <Route path="/group/:groupId" element={<Dashboard />} />
            <Route path="/group/:groupId/activity" element={<Activity />} />
            <Route path="/group/:groupId/invite" element={<InviteMembers />} />
            <Route path="/group/:groupId/add-accounts" element={<AddAccounts />} />
            <Route path="/group/:groupId/account/:accountId" element={<AccountDetail />} />
            <Route path="/group/:groupId/chat" element={<GroupChat />} />
            <Route path="/group/:groupId/members" element={<Members />} />
            <Route path="/group/:groupId/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MobileBottomNav />
        </BrowserRouter>
      </SocketProvider>
    </UserProvider>
  );
}
