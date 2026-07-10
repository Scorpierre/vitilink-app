import { http } from './http';
import type { User, UserRole } from '$lib/types';

export interface UpdateProfileBody {
  username?: string;
  role?: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export const UserAPI = {
  getProfile: (): Promise<{ status: number; message: string; result: User }> =>
    http('/user/profile'),

  updateProfile: (body: UpdateProfileBody): Promise<{ status: number; message: string }> =>
    http('/user/update', { method: 'POST', body: JSON.stringify(body) }),
};
