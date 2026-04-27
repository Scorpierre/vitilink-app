import { writable } from 'svelte/store';
import type { User } from '$lib/types';

const createUserStore = () => {
  const { subscribe, set } = writable<User | null>(null);
  return {
    subscribe,
    setUser: (u: User) => set(u),
    clear: () => set(null)
  };
};

export const user = createUserStore();
