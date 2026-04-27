import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let _id = 0;

const createToastStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(message: string, type: ToastType, duration = 3500) {
    const id = ++_id;
    update(toasts => [...toasts, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  }

  function remove(id: number) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    error: (msg: string, duration?: number) => add(msg, 'error', duration),
    info: (msg: string, duration?: number) => add(msg, 'info', duration),
    remove
  };
};

export const toast = createToastStore();
