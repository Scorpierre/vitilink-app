import { browser } from '$app/environment';
import type { Socket } from 'socket.io-client';
import { DEMO_MODE } from '$lib/demo/mode';
import { createDemoSocket, type DemoSocket } from '$lib/demo/socket';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | DemoSocket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!browser) throw new Error('Socket only available in browser');

  if (DEMO_MODE) {
    if (!socket) socket = createDemoSocket();
    return socket as unknown as Socket;
  }

  if (!socket) {
    const { io } = await import('socket.io-client');
    const url = new URL(API_BASE);
    const path = url.pathname === '/' ? '/socket.io' : `${url.pathname}/socket.io`;
    socket = io(url.origin, {
      path,
      withCredentials: true,
    });
  }

  return socket as Socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
