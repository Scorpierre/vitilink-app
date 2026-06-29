<script lang="ts">
  import { onMount } from 'svelte';
  import { PaymentAPI } from '$lib/api/payment';
  import { AuthAPI } from '$lib/api/auth';
  import type { Order, OrderStatus, User } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import EmptyState from '$lib/components/utils/EmptyState.svelte';
  import { formatPrice } from '$lib/utils/annonce';

  let orders: Order[] = [];
  let currentUser: User | null = null;
  let loading = true;
  let error = '';
  let cancelingId = '';

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      const [ordersData, userData] = await Promise.all([
        PaymentAPI.findMyOrders(),
        AuthAPI.me().catch(() => null),
      ]);
      orders = ordersData;
      currentUser = userData?.result ?? null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors du chargement des commandes.';
    } finally {
      loading = false;
    }
  }

  function isBuyer(order: Order) {
    return order.buyerUserId === currentUser?.id;
  }

  async function cancelOrder(order: Order) {
    if (!confirm('Annuler cette commande en attente de paiement ?')) return;
    cancelingId = order.id;
    try {
      await PaymentAPI.cancelOrder(order.id);
      await load();
    } catch (e) {
      error = e instanceof Error ? e.message : "Impossible d'annuler la commande.";
    } finally {
      cancelingId = '';
    }
  }

  function statusLabel(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'En attente de paiement',
      PAID: 'Payée',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELED: 'Annulée',
      FAILED: 'Échouée',
    };
    return labels[status];
  }

  function statusClass(status: OrderStatus) {
    if (status === 'PAID' || status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
    if (status === 'SHIPPED') return 'bg-blue-50 text-blue-700 ring-blue-200/60';
    if (status === 'FAILED' || status === 'CANCELED') return 'bg-red-50 text-red-700 ring-red-200/60';
    return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
  <h1 class="text-2xl font-semibold text-zinc-950">Mes commandes</h1>

  {#if loading}
    <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement...</div>
  {:else if error}
    <Alert type="error" message={error} />
  {:else if orders.length === 0}
    <EmptyState title="Aucune commande" text="Vous n'avez pas encore passé ou reçu de commande." />
  {:else}
    <div class="mt-6 space-y-3">
      {#each orders as order}
        <div class="card p-4">
          <div class="flex items-center justify-between gap-4">
            <a href={`/home/annonces/${order.annonceId}`} class="min-w-0 flex-1">
              <div class="truncate font-medium text-zinc-950 hover:text-[rgb(var(--primary-700))]">
                {order.annonce?.title ?? 'Annonce supprimée'}
              </div>
              <div class="mt-1 text-sm text-zinc-500">
                {order.quantity} × {formatPrice(order.unitPrice)} ·
                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                {#if !isBuyer(order)}<span class="ml-1 text-violet-600">· Vente</span>{/if}
              </div>
            </a>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClass(order.status)}`}>
                {statusLabel(order.status)}
              </span>
              <span class="font-semibold text-zinc-950">{formatPrice(order.totalAmount / 100)}</span>
            </div>
          </div>

          {#if order.status === 'PENDING' && isBuyer(order)}
            <div class="mt-3 flex gap-2 border-t border-[rgb(var(--border))] pt-3">
              <a href={`/home/checkout/${order.annonceId}`} class="btn-primary flex-1 text-center text-sm">
                Reprendre le paiement
              </a>
              <button
                type="button"
                on:click={() => cancelOrder(order)}
                disabled={cancelingId === order.id}
                class="rounded-2xl px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
              >
                {cancelingId === order.id ? 'Annulation...' : 'Annuler'}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
