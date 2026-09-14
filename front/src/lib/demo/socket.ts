import * as db from './db';

type Handler = (...args: any[]) => void;

const AUTO_REPLIES = [
  'Merci pour votre message, je reviens vers vous rapidement.',
  'Bien noté, je vous confirme cela dans la journée.',
  'Oui tout à fait, n’hésitez pas si vous avez d’autres questions.',
  'Parfait, on reste en contact pour la suite.',
];

function pickAutoReply(): string {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

export interface DemoSocket {
  connected: boolean;
  on: (event: string, cb: Handler) => void;
  off: (event: string, cb: Handler) => void;
  emit: (event: string, payload?: unknown) => void;
  disconnect: () => void;
}

export function createDemoSocket(): DemoSocket {
  const listeners: Record<string, Handler[]> = {};

  function fire(event: string, payload?: unknown) {
    (listeners[event] ?? []).forEach((cb) => cb(payload));
  }

  function handleSend(payload: { conversationId: string; content: string; clientId?: string }) {
    try {
      const message = db.sendMessage(payload.conversationId, payload.content);
      fire('newMessage', { ...message, clientId: payload.clientId });

      const other = db.otherParticipant(payload.conversationId);
      if (other) {
        setTimeout(() => {
          const reply = db.sendMessageAs(payload.conversationId, pickAutoReply(), other);
          fire('newMessage', reply);
        }, 1400 + Math.random() * 1200);
      }
    } catch (e) {
      fire('messageError', { clientId: payload.clientId, message: e instanceof Error ? e.message : 'Erreur' });
    }
  }

  const socket: DemoSocket = {
    connected: true,
    on(event, cb) {
      (listeners[event] ??= []).push(cb);
    },
    off(event, cb) {
      listeners[event] = (listeners[event] ?? []).filter((h) => h !== cb);
    },
    emit(event, payload) {
      if (event === 'sendMessage') {
        handleSend(payload as { conversationId: string; content: string; clientId?: string });
      }
    },
    disconnect() {
      socket.connected = false;
    },
  };

  setTimeout(() => fire('connect'), 50);

  return socket;
}
