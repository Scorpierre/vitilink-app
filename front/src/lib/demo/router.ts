import * as db from './db';

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 180 + Math.random() * 260));
}

function parseBody(body: BodyInit | null | undefined): any {
  if (!body || typeof body !== 'string') return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export async function demoRequest<T>(url: string, options: RequestInit): Promise<T> {
  await delay();

  const [pathname, search] = url.split('?');
  const params = new URLSearchParams(search ?? '');
  const method = (options.method ?? 'GET').toUpperCase();
  const body = parseBody(options.body as BodyInit | null | undefined);
  const segments = pathname.split('/').filter(Boolean);

  // /auth/*
  if (pathname === '/auth/login' && method === 'POST') return db.login(body.email) as T;
  if (pathname === '/auth/me' && method === 'GET') return db.me() as T;
  if (pathname === '/auth/logout' && method === 'POST') {
    db.logout();
    return undefined as T;
  }

  // /user/*
  if (pathname === '/user/signup' && method === 'POST') {
    db.signup(body);
    return undefined as T;
  }
  if (pathname === '/user/profile' && method === 'GET') return db.getProfile() as T;
  if (pathname === '/user/update' && method === 'POST') return db.updateProfile(body) as T;

  // /entreprise/*
  if (pathname === '/entreprise/me' && method === 'GET') return db.getMine() as T;
  if (pathname === '/entreprise/update' && method === 'POST') return db.updateMine(body) as T;

  // /annonces/*
  if (pathname === '/annonces' && method === 'GET') {
    return db.listMarketplace({
      q: params.get('q') ?? undefined,
      region: params.get('region') ?? undefined,
      productType: params.get('productType') ?? undefined,
      availability: params.get('availability') ?? undefined,
    }) as T;
  }
  if (pathname === '/annonces/mine' && method === 'GET') return db.listMine() as T;
  if (segments[0] === 'annonces' && segments.length === 2 && method === 'GET') {
    return db.getOne(segments[1]) as T;
  }
  if (segments[0] === 'annonces' && segments[2] === 'archive' && method === 'POST') {
    return db.archive(segments[1]) as T;
  }

  // /conversations/*
  if (pathname === '/conversations' && method === 'POST') return db.createConversation(body.annonceId) as T;
  if (pathname === '/conversations' && method === 'GET') return db.findAllConversations() as T;
  if (segments[0] === 'conversations' && segments.length === 2 && method === 'GET') {
    return db.findOneConversation(segments[1]) as T;
  }

  // /payment/*
  if (pathname === '/payment/order' && method === 'POST') return db.createOrder(body.annonceId, body.quantity) as T;
  if (pathname === '/payment/orders' && method === 'GET') return db.findMyOrders() as T;
  if (segments[0] === 'payment' && segments[1] === 'orders' && segments.length === 3 && method === 'GET') {
    return db.findOrder(segments[2]) as T;
  }
  if (segments[0] === 'payment' && segments[1] === 'orders' && segments[3] === 'sync' && method === 'POST') {
    return db.syncOrder(segments[2]) as T;
  }
  if (segments[0] === 'payment' && segments[1] === 'orders' && segments[3] === 'cancel' && method === 'POST') {
    return db.cancelOrder(segments[2]) as T;
  }
  if (segments[0] === 'payment' && segments[1] === 'orders' && segments[3] === 'confirm-delivery' && method === 'POST') {
    return db.confirmDelivery(segments[2]) as T;
  }

  // /document/*
  if (pathname === '/document/entreprise' && method === 'GET') return db.listEntrepriseDocuments() as T;
  if (segments[0] === 'document' && segments[2] === 'delete' && method === 'POST') {
    return db.deleteDocument(segments[1]) as T;
  }

  throw new Error(`Route de démo non implémentée : ${method} ${pathname}`);
}
