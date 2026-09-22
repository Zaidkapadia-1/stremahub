import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  // Persistent StreamHub user account
  const [account, setAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('streamhub_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Current active group session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('streamhub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (account) {
      localStorage.setItem('streamhub_account', JSON.stringify(account));
    } else {
      localStorage.removeItem('streamhub_account');
    }
  }, [account]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('streamhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('streamhub_user');
    }
  }, [user]);

  const loginAccount = (accountData) => {
    const data = {
      id: accountData.user?.id || accountData.user?._id || accountData.id,
      name: accountData.user?.name || accountData.name,
      email: accountData.user?.email || accountData.email,
      token: accountData.token
    };
    setAccount(data);
    try {
      localStorage.setItem('streamhub_account', JSON.stringify(data));
    } catch {}
  };

  const logoutAccount = () => {
    try {
      localStorage.removeItem('streamhub_account');
    } catch {}
    setAccount(null);
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...data };
      try {
        localStorage.setItem('streamhub_user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const switchGroup = (groupData) => {
    const updated = {
      groupId: groupData.groupId,
      groupName: groupData.groupName,
      memberId: groupData.memberId,
      role: groupData.role,
      sessionToken: groupData.sessionToken,
      name: groupData.name || account?.name || user?.name || 'Member',
      email: account?.email || user?.email
    };
    setUser(updated);
    try {
      localStorage.setItem('streamhub_user', JSON.stringify(updated));
    } catch {}
  };

  const openGroup = async (groupId, cachedGroupMeta = null) => {
    try {
      const res = await api.post(`/auth/groups/${groupId}/session`);
      const sessionData = res.data;
      const combined = {
        ...sessionData,
        ...(cachedGroupMeta || {})
      };
      switchGroup(combined);
      return combined;
    } catch (err) {
      console.error('Failed to open group session:', err);
      throw err;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('streamhub_user');
    } catch {}
    setUser(null);
  };

  const fullLogout = () => {
    logout();
    logoutAccount();
  };

  return (
    <UserContext.Provider
      value={{
        account,
        user,
        setUser,
        updateUser,
        loginAccount,
        logoutAccount,
        switchGroup,
        openGroup,
        logout,
        fullLogout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
