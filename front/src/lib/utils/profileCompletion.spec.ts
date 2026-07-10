import { describe, expect, it } from 'vitest';
import { getProfileCompletion } from './profileCompletion';
import type { DocumentItem } from '$lib/types';

describe('getProfileCompletion', () => {
  it('uses the same key fields for dashboard and profile completion', () => {
    const completion = getProfileCompletion(
      {
        username: 'charlotte',
        firstName: 'Charlotte',
        lastName: 'Loise',
        phone: '',
      },
      {
        name: 'Pinea',
        type: 'COOPERATIVE',
        siren: '',
        siret: '12345678900012',
        city: 'Reims',
        region: '',
        appellations: ['Champagne'],
        soughtProducts: [],
      },
      [{ id: 'doc-1' } as DocumentItem],
    );

    expect(completion).toEqual({
      percent: 82,
      completed: 9,
      total: 11,
      hasCompany: true,
    });
  });

  it('falls back to documents included on the company when no override is provided', () => {
    const completion = getProfileCompletion({
      username: 'romain',
      entreprise: {
        name: 'Domaine',
        documents: [{ id: 'doc-1' } as DocumentItem],
      },
    });

    expect(completion.completed).toBe(3);
    expect(completion.total).toBe(11);
  });
});
