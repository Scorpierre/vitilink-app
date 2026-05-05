import { http } from './http';
import type { ApiResponse, Entreprise } from '$lib/types';

export const EntrepriseAPI = {
  getMine: (): Promise<ApiResponse<Entreprise | null>> =>
    http('/entreprise/me'),

  updateMine: (body: unknown) =>
    http('/entreprise/update', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
