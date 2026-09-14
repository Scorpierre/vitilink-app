import type { Annonce, AnnoncePurchaseStatus, AnnonceStatus } from '$lib/types';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const PRODUCT_TYPES = [
  'Raisin',
  'Moût de raisin',
  'Jus de raisin'
];

export function normalizeProductType(productType?: string | null) {
  const trimmed = productType?.trim();
  if (!trimmed) return '';
  if (trimmed === 'Moût') return 'Moût de raisin';
  if (trimmed === 'Jus') return 'Jus de raisin';
  return PRODUCT_TYPES.includes(trimmed) ? trimmed : '';
}

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
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('/demo/')) return path;
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

export function getPurchaseStatus(annonce: Annonce): AnnoncePurchaseStatus {
  if (annonce.purchaseStatus) return annonce.purchaseStatus;
  if (annonce.soldOut || annonce.status === 'SOLD') return 'PAID';
  if (annonce.pendingPurchase || annonce.orders?.some((order) => order.status === 'PENDING')) {
    return 'IN_PROGRESS';
  }
  return 'AVAILABLE';
}

export function purchaseStatusLabel(annonce: Annonce) {
  const status = getPurchaseStatus(annonce);
  if (status === 'PAID') return 'Payée';
  if (status === 'IN_PROGRESS') return "En cours d'achat";
  return 'Disponible';
}

export function purchaseStatusClass(annonce: Annonce) {
  const status = getPurchaseStatus(annonce);
  if (status === 'PAID') return 'bg-blue-50 text-blue-700 ring-blue-200/60';
  if (status === 'IN_PROGRESS') return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
}
