export type UserRole = 'SELLER' | 'BUYER' | 'BOTH';

export type CompanyType = 'EARL' | 'GAEC' | 'SAS' | 'SARL' | 'COOPERATIVE' | 'NEGOCE' | 'OTHER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  companyType?: CompanyType;
  region?: string;
  department?: string;
  appellations: string[];
  grapeVarieties: string[];
  surfaceHa?: number;
  annualVolume?: number;
  soughtProducts: string[];
  soughtVolume?: string;
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
  message: string;
  result: T;
}

export type AuthMeResponse = ApiResponse<User>;
export type LoginResponse = ApiResponse<User>;

export interface Entreprise {
  id: string;
  name: string;
  type: CompanyType;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  region?: string;
}

export interface Annonce {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
  entrepriseId: string;
  creatorUserId: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; username: string };
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  annonceId: string;
  buyerId: string;
  isSAV: boolean;
  annonce: { id: string; title: string; entrepriseId: string };
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
