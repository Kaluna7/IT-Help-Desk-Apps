import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../shared/constants';

export type WorkingLock = {
  userId: string;
  userName: string;
  socketId: string;
};

export type WorkingLocks = Record<string, WorkingLock>;

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
