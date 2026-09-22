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
import Login from './pages/Login';
import Register from './pages/Register';
import MyGroups from './pages/MyGroups';
import ProtectedRoute from './components/ProtectedRoute';

function MobileBottomNav() {
  const location = useLocation();
  const { user } = useUser();
  const groupId = user?.groupId;

  if (
    !groupId ||
    location.pathname === '/' ||
    location.pathname === '/create' ||
    location.pathname.startsWith('/join') ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/my-groups'
  ) {
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
            <Route path="/join" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
            <Route path="/join/:code" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
            <Route path="/group/:groupId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/group/:groupId/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/group/:groupId/invite" element={<ProtectedRoute><InviteMembers /></ProtectedRoute>} />
            <Route path="/group/:groupId/add-accounts" element={<ProtectedRoute><AddAccounts /></ProtectedRoute>} />
            <Route path="/group/:groupId/account/:accountId" element={<ProtectedRoute><AccountDetail /></ProtectedRoute>} />
            <Route path="/group/:groupId/chat" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
            <Route path="/group/:groupId/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
            <Route path="/group/:groupId/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MobileBottomNav />
        </BrowserRouter>
      </SocketProvider>
    </UserProvider>
  );
}
