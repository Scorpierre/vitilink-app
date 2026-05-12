import { browser } from '$app/environment';
import type { Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!browser) throw new Error('Socket only available in browser');

  if (!socket) {
    const { io } = await import('socket.io-client');
    const url = new URL(API_BASE);
    const path = url.pathname === '/' ? '/socket.io' : `${url.pathname}/socket.io`;
    socket = io(url.origin, {
      path,
      withCredentials: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
