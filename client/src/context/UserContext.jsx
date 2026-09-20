import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('streamhub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('streamhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('streamhub_user');
    }
  }, [user]);

  const updateUser = (data) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...data };
      try {
        localStorage.setItem('streamhub_user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const logout = () => {
    try {
      localStorage.removeItem('streamhub_user');
    } catch {}
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
