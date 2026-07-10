<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PaymentAPI } from '$lib/api/payment';
  import { AuthAPI } from '$lib/api/auth';
  import { user } from '$lib/stores/user';
  import type { Order, OrderStatus, User } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import EmptyState from '$lib/components/utils/EmptyState.svelte';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import { imageUrl } from '$lib/utils/annonce';

  type ViewKey = 'toutes' | 'a-payer' | 'payees' | 'ventes' | 'historique';

  let orders: Order[] = [];
  let currentUser: User | null = null;
  let loading = true;
  let error = '';
  let cancelingId = '';
  let confirmingId = '';

  $: activeView = normalizeView($page.url.searchParams.get('vue'));
  $: buyerOrders = orders.filter((order) => isBuyer(order));
  $: sellerOrders = orders.filter((order) => !isBuyer(order));
  $: pendingOrders = buyerOrders.filter((order) => order.status === 'PENDING');
  $: paidOrders = buyerOrders.filter((order) => ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status));
  $: historyOrders = orders.filter((order) => ['CANCELED', 'FAILED'].includes(order.status));
  $: visibleOrders =
    activeView === 'a-payer'
      ? pendingOrders
      : activeView === 'payees'
        ? paidOrders
        : activeView === 'ventes'
          ? sellerOrders
          : activeView === 'historique'
            ? historyOrders
            : orders;
  $: totalPaidAmount = paidOrders.reduce((total, order) => total + order.totalAmount, 0);
  $: receivedPaidCount = sellerOrders.filter((order) => ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)).length;
  $: tabs = [
    { key: 'toutes' as ViewKey, label: 'Toutes', count: orders.length },
    { key: 'a-payer' as ViewKey, label: 'À payer', count: pendingOrders.length },
    { key: 'payees' as ViewKey, label: 'Payées', count: paidOrders.length },
    { key: 'ventes' as ViewKey, label: 'Ventes reçues', count: sellerOrders.length },
    { key: 'historique' as ViewKey, label: 'Historique', count: historyOrders.length },
  ];

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
      if (currentUser) user.setUser(currentUser);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors du chargement des commandes.';
    } finally {
      loading = false;
    }
  }

  function normalizeView(value: string | null): ViewKey {
    if (value === 'a-payer' || value === 'payees' || value === 'ventes' || value === 'historique') {
      return value;
    }

    return 'toutes';
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

  async function confirmDelivery(order: Order) {
    confirmingId = order.id;
    error = '';

    try {
      const updated = await PaymentAPI.confirmDelivery(order.id);
      orders = orders.map((item) => (item.id === updated.id ? updated : item));
    } catch (e) {
      error = e instanceof Error ? e.message : 'Impossible de valider la réception.';
    } finally {
      confirmingId = '';
    }
  }

  function canConfirmDelivery(order: Order) {
    return isBuyer(order) && (order.status === 'PAID' || order.status === 'SHIPPED');
  }

  function statusLabel(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'En attente de paiement',
      PAID: 'Payée',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Terminée',
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

  function orderImage(order: Order) {
    const image = order.annonce?.images?.[0];
    return image ? imageUrl(image) : '/assets/images/header.jpg';
  }

  function orderLocation(order: Order) {
    return order.annonce?.location || [order.annonce?.city, order.annonce?.region].filter(Boolean).join(', ') || 'Localisation à préciser';
  }

  function formatCents(amount: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount / 100);
  }

  function orderVolume(order: Order) {
    if (!order.annonce?.volume) return 'Volume à préciser';
    return `${order.annonce.volume.toLocaleString('fr-FR')} ${order.annonce.volumeUnit || 'hl'}`;
  }

  function formatDate(date?: string) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  function getSteps(order: Order) {
    return [
      { label: 'Commande créée', done: true, current: false },
      { label: 'Paiement', done: ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status), current: order.status === 'PENDING' },
      { label: 'Organisation', done: ['SHIPPED', 'DELIVERED'].includes(order.status), current: order.status === 'PAID' },
      { label: 'Terminé', done: order.status === 'DELIVERED', current: order.status === 'SHIPPED' },
    ];
  }
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <section class="overflow-hidden rounded-lg bg-[#181121] text-white shadow-[0_24px_70px_rgba(24,17,33,0.18)]">
    <div class="relative isolate px-5 py-8 sm:px-7 lg:px-9">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,rgba(139,92,246,0.38),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(34,197,94,0.16),transparent_30%)]"></div>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/75">Suivi des commandes</p>
      <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Mes commandes</h1>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Retrouvez les paiements à finaliser, les commandes payées et les ventes reçues. L'achat direct correspond toujours au lot complet.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
          <div class="rounded-lg border border-white/10 bg-white/10 p-4">
            <div class="text-2xl font-semibold">{pendingOrders.length}</div>
            <div class="mt-1 text-xs text-white/55">À payer</div>
          </div>
          <div class="rounded-lg border border-white/10 bg-white/10 p-4">
            <div class="text-2xl font-semibold">{paidOrders.length}</div>
            <div class="mt-1 text-xs text-white/55">Commandes payées</div>
          </div>
          <div class="rounded-lg border border-white/10 bg-white/10 p-4">
            <div class="text-2xl font-semibold">{receivedPaidCount}</div>
            <div class="mt-1 text-xs text-white/55">Ventes payées</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#if loading}
    <div class="mt-6">
      <LoadingState
        title="Chargement des commandes"
        text="Nous synchronisons vos achats, ventes et paiements récents."
      />
    </div>
  {:else if error}
    <div class="mt-6">
      <Alert type="error" message={error} />
    </div>
  {:else if orders.length === 0}
    <div class="mt-6">
      <EmptyState title="Aucune commande" text="Vous n'avez pas encore passé ou reçu de commande." />
    </div>
  {:else}
    <section class="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div class="rounded-lg border border-violet-100 bg-white p-4 shadow-sm">
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Vue</div>
          <nav class="mt-4 grid gap-2" aria-label="Filtres commandes">
            {#each tabs as tab}
              <a
                href={`/dashboard/commandes?vue=${tab.key}`}
                class={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  activeView === tab.key
                    ? 'bg-[#24152f] text-white'
                    : 'bg-[#fbfaf8] text-zinc-700 ring-1 ring-violet-100 hover:bg-violet-50'
                }`}
              >
                <span>{tab.label}</span>
                <span class={`rounded-full px-2 py-0.5 text-xs ${activeView === tab.key ? 'bg-white/15 text-white' : 'bg-white text-violet-700 ring-1 ring-violet-100'}`}>
                  {tab.count}
                </span>
              </a>
            {/each}
          </nav>
        </div>

        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div class="text-sm font-semibold text-emerald-950">Total payé</div>
          <div class="mt-2 text-2xl font-semibold text-emerald-900">{formatCents(totalPaidAmount)}</div>
          <p class="mt-2 text-sm leading-6 text-emerald-900/75">Somme des commandes acheteur déjà payées.</p>
        </div>
      </aside>

      <div class="space-y-4">
        {#if visibleOrders.length === 0}
          <div class="rounded-lg border border-violet-100 bg-white px-5 py-12 text-center shadow-sm">
            <p class="text-sm font-semibold text-[#24152f]">Aucune commande dans cette vue</p>
            <p class="mt-2 text-sm text-zinc-500">Changez de filtre pour voir l'ensemble de vos commandes.</p>
          </div>
        {:else}
          {#each visibleOrders as order}
            <article class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
              <div class="grid lg:grid-cols-[220px_minmax(0,1fr)]">
                <a href={`/dashboard/annonces/${order.annonceId}`} class="relative block min-h-44 overflow-hidden bg-[#24152f]">
                  <img src={orderImage(order)} alt="" class="h-full min-h-44 w-full object-cover opacity-90 transition hover:scale-[1.03]" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/75 to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4">
                    <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                </a>

                <div class="p-5">
                  <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                          {isBuyer(order) ? 'Achat' : 'Vente'}
                        </span>
                        <span class="rounded-full bg-[#fbfaf8] px-3 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-violet-100">
                          Lot complet
                        </span>
                        {#if order.annonce?.productType}
                          <span class="rounded-full bg-[#fbfaf8] px-3 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-violet-100">
                            {order.annonce.productType}
                          </span>
                        {/if}
                      </div>

                      <a href={`/dashboard/annonces/${order.annonceId}`} class="mt-3 block text-xl font-semibold leading-tight text-[#24152f] hover:text-violet-700">
                        {order.annonce?.title ?? 'Annonce supprimée'}
                      </a>
                      <p class="mt-2 text-sm leading-6 text-zinc-500">
                        {order.annonce?.entreprise?.name ?? 'Entreprise à préciser'} · {orderLocation(order)} · {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div class="rounded-lg bg-violet-50 px-4 py-3 text-left ring-1 ring-violet-100 xl:text-right">
                      <div class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Montant</div>
                      <div class="mt-1 text-xl font-semibold text-[#24152f]">{formatCents(order.totalAmount)}</div>
                    </div>
                  </div>

                  <div class="mt-5 grid gap-3 sm:grid-cols-3">
                    <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                      <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Volume</div>
                      <div class="mt-1 text-sm font-semibold text-zinc-900">{orderVolume(order)}</div>
                    </div>
                    <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                      <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Paiement</div>
                      <div class="mt-1 text-sm font-semibold text-zinc-900">{order.payment?.status ?? 'À suivre'}</div>
                    </div>
                    <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                      <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Référence</div>
                      <div class="mt-1 truncate text-sm font-semibold text-zinc-900">{order.id.slice(0, 8)}</div>
                    </div>
                  </div>

                  <div class="mt-5 rounded-lg border border-violet-100 bg-white p-4">
                    <div class="grid gap-3 sm:grid-cols-4">
                      {#each getSteps(order) as step}
                        <div class={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 ${
                          step.done
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                            : step.current
                              ? 'bg-violet-50 text-violet-700 ring-violet-100'
                              : 'bg-zinc-50 text-zinc-400 ring-zinc-100'
                        }`}>
                          {step.label}
                        </div>
                      {/each}
                    </div>
                  </div>

                  <div class="mt-5 flex flex-col gap-2 border-t border-violet-100 pt-4 sm:flex-row sm:justify-end">
                    <a href={`/dashboard/annonces/${order.annonceId}`} class="btn-secondary">Voir l'annonce</a>
                    {#if canConfirmDelivery(order)}
                      <button
                        type="button"
                        on:click={() => confirmDelivery(order)}
                        disabled={confirmingId === order.id}
                        class="btn-primary text-center disabled:opacity-50"
                      >
                        {confirmingId === order.id ? 'Validation...' : 'Valider la réception'}
                      </button>
                    {/if}
                    {#if order.status === 'PENDING' && isBuyer(order)}
                      <a href={`/dashboard/checkout/${order.annonceId}`} class="btn-primary text-center">
                        Reprendre le paiement
                      </a>
                      <button
                        type="button"
                        on:click={() => cancelOrder(order)}
                        disabled={cancelingId === order.id}
                        class="rounded-2xl px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {cancelingId === order.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            </article>
          {/each}
        {/if}
      </div>
    </section>
  {/if}
</div>
