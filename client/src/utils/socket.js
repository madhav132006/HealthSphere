import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

let socket = null;

export const getSocket = (token) => {
  if (!socket && token) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
  }
  return socket;
};

export const connectSocket = (token) => {
  const s = getSocket(token);
  if (s && !s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { getSocket, connectSocket, disconnectSocket };
