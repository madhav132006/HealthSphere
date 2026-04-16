import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const s = connectSocket(token);
      
      s.on('connect', () => {
        console.log('🔌 Socket connected');
        setIsConnected(true);
      });

      s.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      s.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(s);

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
