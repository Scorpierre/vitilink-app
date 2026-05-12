import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { user } from './user';
import type { User } from '$lib/types';

const mockUser: User = {
  id: 'user-1',
  username: 'pierre',
  email: 'pierre@test.com',
  role: 'BUYER',
};

describe('user store', () => {
  beforeEach(() => {
    user.clear();
  });

  it('should start with null value', () => {
    expect(get(user)).toBeNull();
  });

  it('should set user with setUser()', () => {
    user.setUser(mockUser);
    expect(get(user)).toEqual(mockUser);
  });

  it('should clear user with clear()', () => {
    user.setUser(mockUser);
    user.clear();
    expect(get(user)).toBeNull();
  });

  it('should allow subscribing to changes', () => {
    const values: (User | null)[] = [];
    const unsub = user.subscribe((v) => values.push(v));

    user.setUser(mockUser);
    user.clear();
    unsub();

    expect(values).toEqual([null, mockUser, null]);
  });
});
