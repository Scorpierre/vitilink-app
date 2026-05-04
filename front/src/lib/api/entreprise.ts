import { http } from './http';

export const EntrepriseAPI = {
  getMine: () =>
    http('/entreprise/me'),

  updateMine: (body: unknown) =>
    http('/entreprise/update', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};