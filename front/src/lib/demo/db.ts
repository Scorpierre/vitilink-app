import { browser } from '$app/environment';
import type {
  Annonce,
  AnnonceOrder,
  ApiResponse,
  CompanyType,
  Conversation,
  DocumentItem,
  DocumentType,
  Entreprise,
  Message,
  Order,
  User,
  UserRole,
} from '$lib/types';
import { createSeedState, ME_EMAIL, type DemoState } from './data';

const STORAGE_KEY = 'vitilink-demo-state-v1';

let state: DemoState | null = null;

function load(): DemoState {
  if (state) return state;

  if (browser) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw) as DemoState;
        return state;
      }
    } catch {
      // ignore corrupted storage, fall through to reseed
    }
  }

  state = createSeedState();
  persist();
  return state;
}

function persist() {
  if (!browser || !state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota, ...) — demo keeps working in memory
  }
}

export function resetDemo() {
  state = createSeedState();
  persist();
}

function requireAuth(): User {
  const s = load();
  if (!s.loggedIn || !s.currentUserId || !s.users[s.currentUserId]) {
    throw new Error('Non authentifié.');
  }
  return s.users[s.currentUserId];
}

function ok<T>(result: T, message = 'ok'): ApiResponse<T> {
  return { status: 200, message, result };
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- Auth ---------------------------------------------------------------

export function login(email: string): ApiResponse<User> {
  const s = load();
  const existing = Object.values(s.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  const target = existing ?? s.users['u-me'];

  s.loggedIn = true;
  s.currentUserId = target.id;
  persist();

  return ok(hydrateUser(target));
}

export function me(): ApiResponse<User> {
  return ok(hydrateUser(requireAuth()));
}

export function logout(): void {
  const s = load();
  s.loggedIn = false;
  s.currentUserId = null;
  persist();
}

export function signup(body: { username: string; email: string }): void {
  const s = load();
  const id = genId('u');
  s.users[id] = {
    id,
    username: body.username,
    email: body.email,
    role: 'BUYER',
  };
  persist();
}

function hydrateUser(u: User): User {
  const s = load();
  return {
    ...u,
    entreprise: u.entrepriseId ? s.entreprises[u.entrepriseId] ?? null : null,
  };
}

// --- User -----------------------------------------------------------------

export function getProfile(): ApiResponse<User> {
  return ok(hydrateUser(requireAuth()));
}

export function updateProfile(body: {
  username?: string;
  role?: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}) {
  const s = load();
  const current = requireAuth();
  s.users[current.id] = { ...current, ...stripUndefined(body) } as User;
  persist();
  return { status: 200, message: 'Profil mis à jour.' };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (obj[key] !== undefined) out[key] = obj[key];
  });
  return out;
}

// --- Entreprise -------------------------------------------------------------

export function getMine(): ApiResponse<Entreprise | null> {
  const s = load();
  const current = requireAuth();
  const entreprise = current.entrepriseId ? s.entreprises[current.entrepriseId] ?? null : null;
  return ok(entreprise);
}

export function updateMine(body: Record<string, unknown>) {
  const s = load();
  const current = requireAuth();

  let entrepriseId = current.entrepriseId;
  if (!entrepriseId) {
    entrepriseId = genId('e');
    s.entreprises[entrepriseId] = {
      id: entrepriseId,
      name: (body.name as string) || 'Nouvelle entreprise',
      type: (body.type as CompanyType) || 'OTHER',
      status: 'PENDING',
      appellations: [],
      grapeVarieties: [],
      soughtProducts: [],
    };
    s.users[current.id] = { ...current, entrepriseId };
  }

  const entreprise = s.entreprises[entrepriseId];
  s.entreprises[entrepriseId] = { ...entreprise, ...stripUndefined(body) } as Entreprise;
  persist();

  return { status: 200, message: 'Entreprise mise à jour.' };
}

// --- Annonces ---------------------------------------------------------------

export function listMarketplace(filters: { q?: string; region?: string; productType?: string; availability?: string }): ApiResponse<Annonce[]> {
  const s = load();
  let list = Object.values(s.annonces).filter((a) => a.status === 'PUBLISHED' || a.status === 'SOLD');

  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }
  if (filters.region) list = list.filter((a) => a.region === filters.region);
  if (filters.productType) list = list.filter((a) => a.productType === filters.productType);
  if (filters.availability === 'available') {
    list = list.filter((a) => (a.purchaseStatus ?? 'AVAILABLE') === 'AVAILABLE');
  }

  return ok(list.map(withOrders));
}

export function listMine(): ApiResponse<Annonce[]> {
  const s = load();
  const current = requireAuth();
  const list = Object.values(s.annonces).filter((a) => a.creatorUserId === current.id);
  return ok(list.map(withOrders));
}

export function getOne(id: string): ApiResponse<Annonce> {
  const s = load();
  const annonce = s.annonces[id];
  if (!annonce) throw new Error('Annonce introuvable.');
  return ok(withOrders(annonce));
}

function withOrders(annonce: Annonce): Annonce {
  const s = load();
  return {
    ...annonce,
    orders: (annonce.orders ?? []).map((o) => s.orders[o.id] ? toAnnonceOrder(s.orders[o.id]) : o),
  };
}

function toAnnonceOrder(order: Order): AnnonceOrder {
  return {
    id: order.id,
    status: order.status,
    quantity: order.quantity,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    buyerUserId: order.buyerUserId,
    buyer: order.buyer,
  };
}

export function archive(id: string): ApiResponse<Annonce> {
  const s = load();
  const current = requireAuth();
  const annonce = s.annonces[id];
  if (!annonce || annonce.creatorUserId !== current.id) throw new Error('Annonce introuvable.');
  annonce.status = 'ARCHIVED';
  persist();
  return ok(withOrders(annonce));
}

export interface DemoCreateAnnonceInput {
  title: string;
  productType?: string;
  description?: string;
  price?: string;
  volume?: string;
  volumeUnit?: string;
  vintage?: string;
  location?: string;
  city?: string;
  region?: string;
  country?: string;
  availabilityTiming?: string;
  certifications: string[];
  restrictToVerified: boolean;
  images: string[];
}

export function createAnnonce(body: DemoCreateAnnonceInput): ApiResponse<Annonce> {
  const s = load();
  const current = requireAuth();
  const id = genId('a');

  const annonce: Annonce = {
    id,
    title: body.title,
    productType: body.productType,
    description: body.description,
    price: body.price ? Number(body.price) : undefined,
    volume: body.volume ? Number(body.volume) : undefined,
    volumeUnit: body.volumeUnit,
    vintage: body.vintage ? Number(body.vintage) : undefined,
    location: body.location,
    city: body.city,
    region: body.region,
    country: body.country,
    availabilityTiming: body.availabilityTiming,
    certifications: body.certifications,
    images: body.images,
    status: 'PUBLISHED',
    restrictToVerified: body.restrictToVerified,
    creatorUserId: current.id,
    entrepriseId: current.entrepriseId ?? 'e-me',
    entreprise: current.entrepriseId ? s.entreprises[current.entrepriseId] : undefined,
    creator: { id: current.id, username: current.username, firstName: current.firstName, lastName: current.lastName },
    orders: [],
    documents: [],
    _count: { orders: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  s.annonces[id] = annonce;
  persist();
  return ok(annonce, 'Annonce créée.');
}

export function updateAnnonce(id: string, body: DemoCreateAnnonceInput): ApiResponse<Annonce> {
  const s = load();
  const current = requireAuth();
  const annonce = s.annonces[id];
  if (!annonce || annonce.creatorUserId !== current.id) throw new Error('Annonce introuvable.');

  s.annonces[id] = {
    ...annonce,
    title: body.title,
    productType: body.productType,
    description: body.description,
    price: body.price ? Number(body.price) : undefined,
    volume: body.volume ? Number(body.volume) : undefined,
    volumeUnit: body.volumeUnit,
    vintage: body.vintage ? Number(body.vintage) : undefined,
    location: body.location,
    city: body.city,
    region: body.region,
    country: body.country,
    availabilityTiming: body.availabilityTiming,
    certifications: body.certifications,
    images: body.images.length ? body.images : annonce.images,
    restrictToVerified: body.restrictToVerified,
    updatedAt: new Date().toISOString(),
  };

  persist();
  return ok(withOrders(s.annonces[id]), 'Annonce mise à jour.');
}

// --- Payment ------------------------------------------------------------

export function createOrder(annonceId: string, quantity: number) {
  const s = load();
  const current = requireAuth();
  const annonce = s.annonces[annonceId];
  if (!annonce) throw new Error('Annonce introuvable.');

  const existingPaid = (annonce.orders ?? [])
    .map((o) => s.orders[o.id])
    .find((o) => o && o.buyerUserId === current.id && o.status === 'PAID');
  if (existingPaid) {
    return { orderId: existingPaid.id, clientSecret: null, amount: existingPaid.totalAmount, currency: existingPaid.currency, status: existingPaid.status, alreadyPaid: true };
  }

  const unitPriceCents = (annonce.price ?? 0) * 100;
  const id = genId('o');
  const order: Order = {
    id,
    quantity,
    unitPrice: unitPriceCents,
    totalAmount: unitPriceCents * quantity,
    currency: 'eur',
    status: 'PAID',
    annonceId,
    buyerUserId: current.id,
    annonce: {
      id: annonce.id,
      title: annonce.title,
      images: annonce.images,
      creatorUserId: annonce.creatorUserId,
      price: annonce.price,
      volume: annonce.volume,
      volumeUnit: annonce.volumeUnit,
      location: annonce.location,
      city: annonce.city,
      region: annonce.region,
      productType: annonce.productType,
      status: annonce.status,
      entreprise: annonce.entreprise ? { id: annonce.entreprise.id, name: annonce.entreprise.name } : null,
    },
    buyer: { id: current.id, username: current.username },
    payment: {
      id: genId('p'),
      stripePaymentId: `pi_demo_${id}`,
      amount: unitPriceCents * quantity,
      currency: 'eur',
      status: 'SUCCEEDED',
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  s.orders[id] = order;
  annonce.orders = [...(annonce.orders ?? []), toAnnonceOrder(order)];
  annonce.purchaseStatus = 'PAID';
  annonce.soldOut = true;
  annonce.status = 'SOLD';
  persist();

  return { orderId: id, clientSecret: null, amount: order.totalAmount, currency: order.currency, status: order.status, alreadyPaid: true };
}

export function findMyOrders(): Order[] {
  const s = load();
  const current = requireAuth();
  return Object.values(s.orders).filter((o) => o.buyerUserId === current.id);
}

export function findOrder(id: string): Order {
  const s = load();
  const order = s.orders[id];
  if (!order) throw new Error('Commande introuvable.');
  return order;
}

export function syncOrder(id: string): Order {
  return findOrder(id);
}

export function cancelOrder(id: string): Order {
  const s = load();
  const order = s.orders[id];
  if (!order) throw new Error('Commande introuvable.');
  order.status = 'CANCELED';
  order.updatedAt = new Date().toISOString();
  persist();
  return order;
}

export function confirmDelivery(id: string): Order {
  const s = load();
  const order = s.orders[id];
  if (!order) throw new Error('Commande introuvable.');
  order.status = 'DELIVERED';
  order.updatedAt = new Date().toISOString();
  persist();
  return order;
}

// --- Conversations ------------------------------------------------------

export function createConversation(annonceId: string): Conversation {
  const s = load();
  const current = requireAuth();
  const annonce = s.annonces[annonceId];
  if (!annonce) throw new Error('Annonce introuvable.');

  const existing = Object.values(s.conversations).find(
    (c) => c.annonceId === annonceId && c.buyerId === current.id,
  );
  if (existing) return existing;

  const id = genId('c');
  const conversation: Conversation = {
    id,
    annonceId,
    buyerId: current.id,
    isSAV: false,
    annonce: {
      id: annonce.id,
      title: annonce.title,
      entrepriseId: annonce.entrepriseId,
      creatorUserId: annonce.creatorUserId,
      images: annonce.images,
      price: annonce.price ?? null,
      creator: annonce.creator
        ? { id: annonce.creator.id, username: annonce.creator.username, firstName: annonce.creator.firstName, lastName: annonce.creator.lastName }
        : undefined,
    },
    buyer: { id: current.id, username: current.username, firstName: current.firstName, lastName: current.lastName },
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  s.conversations[id] = conversation;
  persist();
  return conversation;
}

export function findAllConversations(): Conversation[] {
  const s = load();
  const current = requireAuth();
  return Object.values(s.conversations).filter(
    (c) => c.buyerId === current.id || c.annonce.creatorUserId === current.id,
  );
}

export function findOneConversation(id: string): Conversation {
  const s = load();
  const conversation = s.conversations[id];
  if (!conversation) throw new Error('Conversation introuvable.');
  return conversation;
}

export function sendMessage(conversationId: string, content: string): Message {
  const s = load();
  const current = requireAuth();
  const conversation = s.conversations[conversationId];
  if (!conversation) throw new Error('Conversation introuvable.');

  const message: Message = {
    id: genId('m'),
    content,
    senderId: current.id,
    sender: { id: current.id, username: current.username },
    conversationId,
    createdAt: new Date().toISOString(),
  };

  conversation.messages = [...conversation.messages, message];
  conversation.updatedAt = message.createdAt;
  persist();

  return message;
}

export function sendMessageAs(conversationId: string, content: string, sender: { id: string; username: string }): Message {
  const s = load();
  const conversation = s.conversations[conversationId];
  if (!conversation) throw new Error('Conversation introuvable.');

  const message: Message = {
    id: genId('m'),
    content,
    senderId: sender.id,
    sender,
    conversationId,
    createdAt: new Date().toISOString(),
  };

  conversation.messages = [...conversation.messages, message];
  conversation.updatedAt = message.createdAt;
  persist();

  return message;
}

export function otherParticipant(conversationId: string): { id: string; username: string } | null {
  const s = load();
  const current = requireAuth();
  const conversation = s.conversations[conversationId];
  if (!conversation) return null;
  if (conversation.buyerId === current.id) {
    const sellerId = conversation.annonce.creatorUserId;
    const seller = sellerId ? s.users[sellerId] : null;
    return seller ? { id: seller.id, username: seller.username } : null;
  }
  return conversation.buyer ? { id: conversation.buyer.id, username: conversation.buyer.username } : null;
}

// --- Documents ------------------------------------------------------------

export function listEntrepriseDocuments(): ApiResponse<DocumentItem[]> {
  return ok(Object.values(load().documents));
}

export function deleteDocument(id: string) {
  const s = load();
  delete s.documents[id];
  persist();
  return { status: 200, message: 'Document supprimé.' };
}

export function uploadEntrepriseDocument(url: string, type: DocumentType, label: string): DocumentItem {
  const s = load();
  const id = genId('d');
  const doc: DocumentItem = {
    id,
    url,
    type,
    status: 'PENDING',
    visibility: 'PUBLIC',
    label,
    createdAt: new Date().toISOString(),
  };
  s.documents[id] = doc;
  persist();
  return doc;
}

export { ME_EMAIL };
