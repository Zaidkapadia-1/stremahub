import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.sessionToken) {
      setSocket(null);
      return undefined;
    }
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { sessionToken: user.sessionToken }
    });

    s.on('connect', () => {
      if (user?.groupId) {
        s.emit('join_group_room');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.sessionToken]);

  useEffect(() => {
    if (socket && user?.groupId) {
      socket.emit('join_group_room');
    }
  }, [socket, user?.groupId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
