import type { DocumentItem, User } from '$lib/types';

type CompletionCompany = {
  name?: string | null;
  type?: string | null;
  siren?: string | null;
  siret?: string | null;
  city?: string | null;
  region?: string | null;
  appellations?: string[] | null;
  soughtProducts?: string[] | null;
  documents?: DocumentItem[] | null;
};

type CompletionUser = Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'phone'>> & {
  entreprise?: CompletionCompany | null;
};

export type ProfileCompletion = {
  percent: number;
  completed: number;
  total: number;
  hasCompany: boolean;
};

export function getProfileCompletion(
  currentUser: CompletionUser | null,
  companyOverride?: CompletionCompany | null,
  documentOverride?: DocumentItem[] | null
): ProfileCompletion {
  const company = companyOverride ?? currentUser?.entreprise ?? null;
  const documents = documentOverride ?? company?.documents ?? [];

  const fields = [
    currentUser?.username,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.phone,
    company?.name,
    company?.type,
    company?.siren || company?.siret,
    company?.city,
    company?.region,
    hasAny(company?.appellations) || hasAny(company?.soughtProducts),
    documents?.length,
  ];

  const completed = fields.filter(hasCompletedValue).length;

  return {
    percent: Math.round((completed / fields.length) * 100),
    completed,
    total: fields.length,
    hasCompany: Boolean(company),
  };
}

function hasAny(values?: string[] | null) {
  return Boolean(values?.some((value) => value.trim().length > 0));
}

function hasCompletedValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}
