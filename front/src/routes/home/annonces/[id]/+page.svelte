<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { AnnonceAPI } from '$lib/api/annonce';
  import { AuthAPI } from '$lib/api/auth';
  import { ConversationAPI } from '$lib/api/conversation';
  import { PaymentAPI } from '$lib/api/payment';
  import type { Annonce, User } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import AnnonceMeta from '$lib/components/annonces/AnnonceMeta.svelte';
  import {
    formatPrice,
    formatVolume,
    imageUrl,
    statusClass,
    statusLabel
  } from '$lib/utils/annonce';
  import type { AnnonceOrder, OrderStatus } from '$lib/types';

  function orderStatusLabel(status: OrderStatus) {
    const map: Record<OrderStatus, string> = {
      PENDING: 'En attente de paiement', PAID: 'Payée',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée',
      CANCELED: 'Annulée', FAILED: 'Échouée',
    };
    return map[status];
  }

  function orderStatusClass(status: OrderStatus) {
    if (status === 'PAID' || status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
    if (status === 'SHIPPED') return 'bg-blue-50 text-blue-700 ring-blue-200/60';
    if (status === 'FAILED' || status === 'CANCELED') return 'bg-red-50 text-red-700 ring-red-200/60';
    return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  }

  let annonce: Annonce | null = null;
  let currentUser: User | null = null;
  let loading = true;
  let error = '';
  let contactLoading = false;
  let contactError = '';
  let selectedImage = '';
  let fullscreenOpen = false;

  $: isMine = !!annonce && !!currentUser && annonce.creatorUserId === currentUser.id;
  $: myActiveOrder = annonce?.orders?.find(
    (o) => o.buyerUserId === currentUser?.id && (o.status === 'PAID' || o.status === 'PENDING')
  ) ?? null;
  $: sellerOrders = isMine ? (annonce?.orders ?? []) : [];
  $: isSold = !!annonce && (annonce.soldOut === true || annonce.status === 'SOLD');
  $: canBuy = !isMine && !isSold && annonce?.status === 'PUBLISHED' && !!annonce?.price && !myActiveOrder;
  $: location = annonce?.location || [annonce?.city, annonce?.region].filter(Boolean).join(', ');
  $: selectedIndex = annonce?.images?.findIndex((path) => path === selectedImage) ?? -1;

  onMount(() => {
    loadDetail();
    // Rafraîchir quand l'utilisateur revient sur l'onglet (ex: après paiement dans un autre onglet)
    const onVisibility = () => { if (document.visibilityState === 'visible') loadDetail(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  });

  async function loadDetail() {
    loading = true;
    error = '';

    try {
      const [annonceData, userData] = await Promise.all([
        AnnonceAPI.getOne($page.params.id),
        AuthAPI.me().catch(() => null)
      ]);

      annonce = annonceData.result;
      currentUser = userData?.result ?? null;
      selectedImage = annonce.images?.[0] ?? '';
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors du chargement de l'annonce.";
    } finally {
      loading = false;
    }
  }

  function openFullscreen(path = selectedImage) {
    if (!path) return;
    selectedImage = path;
    fullscreenOpen = true;
  }

  function closeFullscreen() {
    fullscreenOpen = false;
  }

  function showImage(offset: number) {
    if (!annonce?.images?.length) return;
    const current = selectedIndex >= 0 ? selectedIndex : 0;
    const next = (current + offset + annonce.images.length) % annonce.images.length;
    selectedImage = annonce.images[next];
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!fullscreenOpen) return;
    if (event.key === 'Escape') closeFullscreen();
    if (event.key === 'ArrowLeft') showImage(-1);
    if (event.key === 'ArrowRight') showImage(1);
  }

  async function contactSeller() {
    if (!annonce) return;
    contactLoading = true;
    contactError = '';
    try {
      const conversation = await ConversationAPI.create(annonce.id);
      await goto(`/home/conversations/${conversation.id}`);
    } catch (e) {
      contactError = e instanceof Error ? e.message : 'Impossible de contacter le vendeur.';
    } finally {
      contactLoading = false;
    }
  }

  let cancelLoading = false;
  async function cancelMyOrder() {
    if (!myActiveOrder || myActiveOrder.status !== 'PENDING') return;
    if (!confirm('Annuler cette commande en attente de paiement ?')) return;
    cancelLoading = true;
    try {
      await PaymentAPI.cancelOrder(myActiveOrder.id);
      await loadDetail();
    } catch (e) {
      contactError = e instanceof Error ? e.message : "Impossible d'annuler la commande.";
    } finally {
      cancelLoading = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  {#if loading}
    <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement de l'annonce...</div>
  {:else if error}
    <Alert type="error" message={error} />
  {:else if annonce}
    <div class="mb-8 flex items-center gap-2 text-sm text-zinc-400">
      <a href="/home/marche" class="hover:text-zinc-600">Annonces</a>
      <span>/</span>
      <span class="font-medium text-zinc-600">{annonce.title}</span>
    </div>

    <div class="space-y-6">
      <section class="card overflow-hidden">
        <div class="grid gap-0 lg:grid-cols-[380px_1fr]">
          <div class="border-b border-[rgb(var(--border))] bg-white p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <div class="flex gap-3 lg:flex-row">
              {#if annonce.images?.length > 1}
                <div class="hidden max-h-[340px] w-20 shrink-0 space-y-2 overflow-y-auto pr-1 lg:block">
                  {#each annonce.images as path, index}
                    <button
                      type="button"
                      on:click={() => (selectedImage = path)}
                      class={`aspect-square w-full overflow-hidden rounded-2xl border bg-white transition ${
                        selectedImage === path ? 'border-violet-400 ring-4 ring-violet-100' : 'border-[rgb(var(--border))]'
                      }`}
                      aria-label={`Voir l'image ${index + 1}`}
                    >
                      <img src={imageUrl(path)} alt={annonce.title} class="h-full w-full object-cover" />
                    </button>
                  {/each}
                </div>
              {/if}

              <div class="min-w-0 flex-1">
                <div class="relative overflow-hidden rounded-[1.5rem] border border-[rgb(var(--border))] bg-[rgb(var(--primary-50))]">
                  {#if selectedImage}
                    <button
                      type="button"
                      on:click={() => openFullscreen()}
                      class="block w-full"
                      aria-label="Voir l'image en plein écran"
                    >
                      <img src={imageUrl(selectedImage)} alt={annonce.title} class="aspect-[4/3] w-full object-cover" />
                    </button>

                    <button
                      type="button"
                      on:click={() => openFullscreen()}
                      class="absolute bottom-3 right-3 rounded-2xl bg-white/95 px-3 py-2 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-white"
                    >
                      Plein écran
                    </button>
                  {:else}
                    <div class="flex aspect-[4/3] w-full items-center justify-center text-sm font-semibold text-[rgb(var(--primary-700))]">
                      VitiLink
                    </div>
                  {/if}
                </div>

                {#if annonce.images?.length > 1}
                  <div class="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {#each annonce.images as path, index}
                      <button
                        type="button"
                        on:click={() => (selectedImage = path)}
                        class={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${
                          selectedImage === path ? 'border-violet-400 ring-4 ring-violet-100' : 'border-[rgb(var(--border))]'
                        }`}
                        aria-label={`Voir l'image ${index + 1}`}
                      >
                        <img src={imageUrl(path)} alt={annonce.title} class="h-full w-full object-cover" />
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div class="p-5 sm:p-6">
          <div class="flex flex-wrap gap-2">
            {#if annonce.productType}
              <span class="badge-soft">{annonce.productType}</span>
            {/if}
            <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClass(annonce.status)}`}>
              {statusLabel(annonce.status)}
            </span>
          </div>

          <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-zinc-950 md:text-3xl">{annonce.title}</h1>
              <p class="mt-2 text-sm text-zinc-500">{annonce.entreprise?.name || 'Entreprise non renseignée'}</p>
            </div>
            <div class="text-xl font-semibold text-zinc-950">{formatPrice(annonce.price)}</div>
          </div>

          {#if annonce.description}
            <p class="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600">{annonce.description}</p>
          {/if}

          <div class="mt-6 grid grid-cols-2 gap-5">
            <AnnonceMeta label="Volume" value={formatVolume(annonce)} />
            <AnnonceMeta label="Localisation" value={location} />
            <AnnonceMeta label="Timing" value={annonce.availabilityTiming || 'À convenir'} />
            <AnnonceMeta label="Millésime" value={annonce.vintage?.toString() || '—'} />
            <AnnonceMeta label="Pays" value={annonce.country || 'France'} />
            <AnnonceMeta label="Accès" value={annonce.restrictToVerified ? 'Entreprises vérifiées' : 'Ouvert'} />
          </div>

          {#if annonce.certifications?.length}
            <div class="mt-6">
              <div class="mb-2 text-sm font-medium text-zinc-800">Certifications</div>
              <div class="flex flex-wrap gap-2">
                {#each annonce.certifications as certification}
                  <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {certification}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            {#if isMine}
              <a href={`/home/mes-annonces/${annonce.id}/edit`} class="btn-primary">Modifier l'annonce</a>
              <a href="/home/mes-annonces" class="btn-secondary">Retour à mes annonces</a>
            {:else}
              <button
                type="button"
                on:click={contactSeller}
                disabled={contactLoading}
                class="btn-primary disabled:opacity-50"
              >
                {contactLoading ? 'Connexion...' : 'Contacter le producteur'}
              </button>
              {#if canBuy}
                <a href={`/home/checkout/${annonce.id}`} class="btn-primary">Acheter</a>
              {:else if myActiveOrder?.status === 'PENDING' && !isSold}
                <a href={`/home/checkout/${annonce.id}`} class="btn-primary">Reprendre le paiement</a>
                <button
                  type="button"
                  on:click={cancelMyOrder}
                  disabled={cancelLoading}
                  class="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelLoading ? 'Annulation...' : 'Annuler la commande'}
                </button>
              {:else if myActiveOrder?.status === 'PAID'}
                <a href="/home/commandes" class={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1 ${orderStatusClass(myActiveOrder.status)}`}>
                  Ma commande — {orderStatusLabel(myActiveOrder.status)}
                </a>
              {:else if isSold}
                <span class="inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500 ring-1 ring-zinc-200">
                  Annonce vendue
                </span>
              {/if}
              <a href="/home/marche" class="btn-secondary">Retour aux annonces</a>
            {/if}
          </div>
          {#if contactError}
            <p class="mt-2 text-sm text-red-600">{contactError}</p>
          {/if}
          </div>
        </div>
      </section>

      {#if isMine && sellerOrders.length > 0}
        <section class="card p-6">
          <h2 class="text-base font-semibold text-zinc-950">Commandes reçues ({sellerOrders.length})</h2>
          <div class="mt-4 space-y-3">
            {#each sellerOrders as order}
              <div class="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                <div>
                  <div class="text-sm font-medium text-zinc-900">{order.buyer?.username ?? 'Acheteur'}</div>
                  <div class="mt-0.5 text-xs text-zinc-500">
                    {order.quantity} unité(s) · {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${orderStatusClass(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                  <span class="text-sm font-semibold text-zinc-950">{formatPrice(order.totalAmount / 100)}</span>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <section class="card p-6">
        <h2 class="text-base font-semibold text-zinc-950">Entreprise</h2>
        <div class="mt-4 grid grid-cols-2 gap-5 md:grid-cols-4">
          <AnnonceMeta label="Nom" value={annonce.entreprise?.name || '—'} />
          <AnnonceMeta label="Type" value={annonce.entreprise?.type || '—'} />
          <AnnonceMeta label="Statut" value={annonce.entreprise?.status === 'VERIFIED' ? 'Vérifiée' : 'Non vérifiée'} />
          <AnnonceMeta label="Région" value={annonce.entreprise?.region || annonce.region || '—'} />
        </div>
      </section>
    </div>

    {#if fullscreenOpen && selectedImage}
      <div class="fixed inset-0 z-50 bg-zinc-950/95 px-4 py-4 text-white sm:px-6" role="dialog" aria-modal="true">
        <div class="mx-auto flex h-full max-w-7xl flex-col">
          <div class="flex items-center justify-between gap-4 pb-4">
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold">{annonce.title}</div>
              {#if annonce.images?.length}
                <div class="mt-1 text-xs text-white/60">
                  Image {(selectedIndex >= 0 ? selectedIndex : 0) + 1} / {annonce.images.length}
                </div>
              {/if}
            </div>

            <button
              type="button"
              on:click={closeFullscreen}
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl leading-none transition hover:bg-white/20"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div class="relative min-h-0 flex-1">
            <img src={imageUrl(selectedImage)} alt={annonce.title} class="h-full w-full object-contain" />

            {#if annonce.images?.length > 1}
              <button
                type="button"
                on:click={() => showImage(-1)}
                class="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20 sm:left-3"
                aria-label="Image précédente"
              >
                ‹
              </button>

              <button
                type="button"
                on:click={() => showImage(1)}
                class="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20 sm:right-3"
                aria-label="Image suivante"
              >
                ›
              </button>
            {/if}
          </div>

          {#if annonce.images?.length > 1}
            <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
              {#each annonce.images as path, index}
                <button
                  type="button"
                  on:click={() => (selectedImage = path)}
                  class={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition sm:h-16 sm:w-16 ${
                    selectedImage === path ? 'border-white ring-2 ring-white/40' : 'border-white/20'
                  }`}
                  aria-label={`Afficher l'image ${index + 1}`}
                >
                  <img src={imageUrl(path)} alt={annonce.title} class="h-full w-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>
