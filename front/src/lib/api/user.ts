import { http } from './http';
import type { User } from '$lib/types';

export interface UpdateProfileBody {
  username?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  companyType?: string;
  region?: string;
  department?: string;
  appellations?: string[];
  grapeVarieties?: string[];
  surfaceHa?: number;
  annualVolume?: number;
  soughtProducts?: string[];
  soughtVolume?: string;
}

export const UserAPI = {
  getProfile: (): Promise<{ status: number; message: string; result: User }> =>
    http('/user/profile'),

  updateProfile: (body: UpdateProfileBody): Promise<{ status: number; message: string }> =>
    http('/user/update', { method: 'POST', body: JSON.stringify(body) }),
};
