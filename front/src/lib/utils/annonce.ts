import type { Annonce, AnnonceStatus } from '$lib/types';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const PRODUCT_TYPES = [
  'Raisin',
  'Moût',
  'Jus',
  'Vin en vrac',
  'Prestations',
  'Matériel',
  'Autre'
];

export const REGIONS = [
  'Alsace',
  'Beaujolais',
  'Bordeaux',
  'Bourgogne',
  'Champagne',
  'Corse',
  'Jura',
  'Languedoc-Roussillon',
  'Loire',
  'Provence',
  'Rhône',
  'Savoie',
  'Sud-Ouest'
];

export const DEFAULT_CERTIFICATIONS = [
  'Bio',
  'HVE',
  'Demeter',
  'Terra Vitis',
  'AOP',
  'IGP',
  'Sans sulfites ajoutés'
];

export function imageUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export function formatVolume(annonce: Annonce) {
  if (!annonce.volume) return 'Volume à préciser';
  return `${annonce.volume.toLocaleString('fr-FR')} ${annonce.volumeUnit || 'hl'}`;
}

export function formatPrice(price?: number) {
  if (!price) return 'Prix sur demande';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
}

export function statusLabel(status: AnnonceStatus) {
  if (status === 'PUBLISHED') return 'Publiée';
  if (status === 'ARCHIVED') return 'Archivée';
  if (status === 'SOLD') return 'Vendue';
  return 'Brouillon';
}

export function statusClass(status: AnnonceStatus) {
  if (status === 'PUBLISHED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
  if (status === 'ARCHIVED') return 'bg-zinc-100 text-zinc-600 ring-zinc-200/60';
  if (status === 'SOLD') return 'bg-blue-50 text-blue-700 ring-blue-200/60';
  return 'bg-amber-50 text-amber-700 ring-amber-200/60';
}
