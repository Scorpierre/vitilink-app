export type UserRole = 'SELLER' | 'BUYER' | 'BOTH';

export type CompanyType =
  | 'EARL'
  | 'GAEC'
  | 'SAS'
  | 'SARL'
  | 'COOPERATIVE'
  | 'NEGOCE'
  | 'OTHER';

export type EntrepriseStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DocumentType =
  | 'USER_DOC'
  | 'SALE_DOC'
  | 'KBIS'
  | 'SIRENE_NOTICE'
  | 'VAT_CERTIFICATE'
  | 'RIB'
  | 'CVI_CERTIFICATE'
  | 'IDENTITY_PROOF'
  | 'OTHER';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DocumentItem {
  id: string;
  url: string;
  type: DocumentType;
  status: DocumentStatus;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  label?: string;
  comment?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Entreprise {
  id: string;
  name: string;
  type: CompanyType;
  status: EntrepriseStatus;

  siren?: string;
  siret?: string;
  vatNumber?: string;
  cviNumber?: string;

  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;

  region?: string;
  department?: string;
  appellations: string[];
  grapeVarieties: string[];
  surfaceHa?: number;
  annualVolume?: number;
  soughtProducts: string[];
  soughtVolume?: string;

  verificationNote?: string;
  verifiedAt?: string;

  documents?: DocumentItem[];

  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  entrepriseId?: string;
  entreprise?: Entreprise | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface SignupBody {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface ApiResponse<T> {
  status?: number;
  message: string;
  result: T;
}

export type AuthMeResponse = ApiResponse<User>;
export type LoginResponse = ApiResponse<User>;