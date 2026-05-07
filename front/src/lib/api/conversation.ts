import { http } from './http';
import type { Conversation } from '$lib/types';

export const ConversationAPI = {
  create: (annonceId: string) =>
    http<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ annonceId }),
    }),

  findAll: () => http<Conversation[]>('/conversations'),

  findOne: (id: string) => http<Conversation>(`/conversations/${id}`),
};
