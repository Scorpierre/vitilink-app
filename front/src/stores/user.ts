import { writable } from 'svelte/store';

export interface User {
  id: string;
  username: string;
  email: string;
}

const createUserStore = () => {
  const { subscribe, set } = writable<User | null>(null);
  return {
    subscribe,
    setUser: (u: User) => set(u),
    clear: () => set(null)
  };
};

export const user = createUserStore();
