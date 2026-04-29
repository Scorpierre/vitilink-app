import { browser } from '$app/environment';
import type { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!browser) throw new Error('Socket only available in browser');

  if (!socket) {
    const { io } = await import('socket.io-client');
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
