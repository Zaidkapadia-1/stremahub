import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_URL) {
  throw new Error('VITE_API_URL is required in production.');
}

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [slotsByAccount, setSlotsByAccount] = useState({});

  useEffect(() => {
    if (!user?.sessionToken) {
      setSocket(null);
      setSlotsByAccount({});
      return undefined;
    }

    const s = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { sessionToken: user.sessionToken }
    });

    // Listen globally for real-time slot events
    s.on('slot_updated', ({ accountId, slots }) => {
      setSlotsByAccount((prev) => ({
        ...prev,
        [accountId]: slots || []
      }));
    });

    s.on('slots_synced', (accountsWithSlots) => {
      if (Array.isArray(accountsWithSlots)) {
        setSlotsByAccount(
          Object.fromEntries(
            accountsWithSlots.map(({ accountId, slots }) => [accountId, slots || []])
          )
        );
      }
    });

    // On connect and reconnect: join group room to fetch latest slot state
    s.on('connect', () => {
      if (user?.groupId) {
        s.emit('join_group_room');
      }
    });

    if (s.io) {
      s.io.on('reconnect', () => {
        if (user?.groupId) {
          s.emit('join_group_room');
        }
      });
    }

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.sessionToken]);

  // When active group changes, sync immediately
  useEffect(() => {
    if (socket && user?.groupId) {
      setSlotsByAccount({});
      socket.emit('join_group_room');
    }
  }, [socket, user?.groupId]);

  const requestSlotsSync = useCallback(() => {
    if (socket && user?.groupId) {
      socket.emit('join_group_room');
    }
  }, [socket, user?.groupId]);

  return (
    <SocketContext.Provider value={{ socket, slotsByAccount, requestSlotsSync }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || {};
