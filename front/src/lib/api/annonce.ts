import type { AnnonceListResponse, AnnonceResponse, CreateAnnonceBody } from '$lib/types';
import { http } from './http';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const AnnonceAPI = {
  listMarketplace: (filters: { q?: string; region?: string; productType?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString();
    return http<AnnonceListResponse>(`/annonces${query ? `?${query}` : ''}`);
  },

  listMine: () => http<AnnonceListResponse>('/annonces/mine'),

  getOne: (id: string) => http<AnnonceResponse>(`/annonces/${id}`),

  archive: (id: string) =>
    http<AnnonceResponse>(`/annonces/${id}/archive`, {
      method: 'POST'
    }),

  async create(body: CreateAnnonceBody) {
    const formData = buildAnnonceFormData(body);

    const res = await fetch(`${API_BASE}/annonces`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Erreur lors de la création de l'annonce");
    }

    return data as AnnonceResponse;
  },

  async update(id: string, body: CreateAnnonceBody) {
    const formData = buildAnnonceFormData(body);

    const res = await fetch(`${API_BASE}/annonces/${id}/update`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Erreur lors de la mise à jour de l'annonce");
    }

    return data as AnnonceResponse;
  }
};

function buildAnnonceFormData(body: CreateAnnonceBody) {
  const formData = new FormData();

  formData.append('title', body.title);
  appendIfPresent(formData, 'productType', body.productType);
  appendIfPresent(formData, 'description', body.description);
  appendIfPresent(formData, 'price', body.price);
  appendIfPresent(formData, 'volume', body.volume);
  appendIfPresent(formData, 'volumeUnit', body.volumeUnit);
  appendIfPresent(formData, 'vintage', body.vintage);
  appendIfPresent(formData, 'location', body.location);
  appendIfPresent(formData, 'city', body.city);
  appendIfPresent(formData, 'region', body.region);
  appendIfPresent(formData, 'country', body.country);
  appendIfPresent(formData, 'availabilityTiming', body.availabilityTiming);
  formData.append('restrictToVerified', String(body.restrictToVerified));
  body.certifications.forEach((certification) => formData.append('certifications', certification));
  if (body.existingImages) {
    if (body.existingImages.length) {
      body.existingImages.forEach((path) => formData.append('existingImages', path));
    } else {
      formData.append('existingImages', '');
    }
  }
  body.images.forEach((image) => formData.append('images', image));

  return formData;
}

function appendIfPresent(formData: FormData, key: string, value?: string | number | null) {
  if (value === null || value === undefined || value === '') return;
  formData.append(key, String(value).trim());
}
