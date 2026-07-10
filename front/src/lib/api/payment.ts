import { http } from './http';
import type { Order, CreateOrderResponse } from '$lib/types';

export const PaymentAPI = {
  createOrder: (annonceId: string, quantity: number) =>
    http<CreateOrderResponse>('/payment/order', {
      method: 'POST',
      body: JSON.stringify({ annonceId, quantity }),
    }),

  findMyOrders: () => http<Order[]>('/payment/orders'),

  findOrder: (id: string) => http<Order>(`/payment/orders/${id}`),

  syncOrder: (id: string) =>
    http<Order>(`/payment/orders/${id}/sync`, { method: 'POST' }),

  cancelOrder: (id: string) =>
    http<Order>(`/payment/orders/${id}/cancel`, { method: 'POST' }),

  confirmDelivery: (id: string) =>
    http<Order>(`/payment/orders/${id}/confirm-delivery`, { method: 'POST' }),
};
