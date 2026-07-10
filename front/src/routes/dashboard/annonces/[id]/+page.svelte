<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { AnnonceAPI } from '$lib/api/annonce';
  import { AuthAPI } from '$lib/api/auth';
  import { ConversationAPI } from '$lib/api/conversation';
  import { DocumentAPI } from '$lib/api/document';
  import { PaymentAPI } from '$lib/api/payment';
  import { user } from '$lib/stores/user';
  import type { Annonce, DocumentItem, DocumentVisibility, OrderStatus, User } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import DetailGroup from '$lib/components/annonces/DetailGroup.svelte';
  import DetailRow from '$lib/components/annonces/DetailRow.svelte';
  import {
    formatPrice,
    formatVolume,
    getPurchaseStatus,
    imageUrl,
    purchaseStatusClass,
    purchaseStatusLabel,
    statusClass,
    statusLabel
  } from '$lib/utils/annonce';

  let annonce: Annonce | null = null;
  let currentUser: User | null = null;
  let loading = true;
  let error = '';
  let contactLoading = false;
  let contactError = '';
  let cancelLoading = false;
  let receiptLoading = false;
  let selectedImage = '';

  $: galleryImages = annonce?.images ?? [];
  $: hasImages = galleryImages.length > 0;
  $: selectedIndex = galleryImages.findIndex((path) => path === selectedImage);
  $: visibleImage = selectedImage ? imageUrl(selectedImage) : '/assets/images/header.jpg';
  $: isMine = !!annonce && !!currentUser && annonce.creatorUserId === currentUser.id;
  $: myActiveOrder = annonce?.orders?.find(
    (order) =>
      order.buyerUserId === currentUser?.id &&
      (order.status === 'PENDING' ||
        order.status === 'PAID' ||
        order.status === 'SHIPPED' ||
        order.status === 'DELIVERED')
  ) ?? null;
  $: sellerOrders = isMine ? (annonce?.orders ?? []) : [];
  $: currentPurchaseStatus = annonce ? getPurchaseStatus(annonce) : 'AVAILABLE';
  $: isSold = currentPurchaseStatus === 'PAID';
  $: isInProgress = currentPurchaseStatus === 'IN_PROGRESS';
  $: canBuy = !isMine && currentPurchaseStatus === 'AVAILABLE' && annonce?.status === 'PUBLISHED' && !!annonce?.price && !myActiveOrder;
  $: location = annonce?.location || [annonce?.city, annonce?.region].filter(Boolean).join(', ');
  $: sellerName = annonce?.entreprise?.name || annonce?.creator?.username || 'Producteur VitiLink';
  $: company = annonce?.entreprise ?? null;
  $: companyLocation = company ? formatCompanyLocation(company) : '';
  $: creatorDisplayName = [
    annonce?.creator?.firstName,
    annonce?.creator?.lastName,
  ].filter(Boolean).join(' ') || annonce?.creator?.username || 'Non renseigné';
  $: infoItems = annonce
    ? [
        { label: 'Volume', value: formatVolume(annonce), icon: 'scale' },
        { label: 'Localisation', value: location || 'Non renseigné', icon: 'pin' },
        { label: 'Disponibilité', value: annonce.availabilityTiming || 'À convenir', icon: 'calendar' },
        { label: 'Millésime', value: annonce.vintage?.toString() || '—', icon: 'clock' },
      ]
    : [];
  $: conditionItems = annonce
    ? [
        { label: 'Accès', value: annonce.restrictToVerified ? 'Entreprises vérifiées' : 'Ouvert', icon: 'shield' },
        { label: "État d'achat", value: purchaseStatusLabel(annonce), icon: 'cart' },
        { label: 'Pays', value: annonce.country || 'France', icon: 'map' },
      ]
    : [];
  $: companyIdentityItems = company
    ? [
        { label: 'Nom légal', value: fallback(company.name), icon: 'building' },
        { label: 'Type', value: formatCompanyType(company.type), icon: 'bank' },
        { label: 'Statut', value: formatCompanyStatus(company.status), icon: 'shield' },
        { label: 'SIREN', value: fallback(company.siren), icon: 'hash' },
        { label: 'SIRET', value: fallback(company.siret), icon: 'file' },
        { label: 'TVA intracommunautaire', value: fallback(company.vatNumber), icon: 'file' },
        { label: 'Numéro CVI', value: fallback(company.cviNumber), icon: 'grape' },
        { label: 'Profil créé', value: formatDate(company.createdAt), icon: 'calendar' },
      ]
    : [];
  $: companyLocationItems = company
    ? [
        { label: 'Adresse', value: joinValues([company.addressLine1, company.addressLine2]), icon: 'pin' },
        { label: 'Code postal / ville', value: joinValues([company.postalCode, company.city], ' '), icon: 'map' },
        { label: 'Département', value: fallback(company.department), icon: 'map' },
        { label: 'Région', value: fallback(company.region), icon: 'pin' },
        { label: 'Pays', value: fallback(company.country), icon: 'map' },
        { label: 'Localisation complète', value: companyLocation || 'Non renseigné', icon: 'pin' },
      ]
    : [];
  $: vineyardItems = company
    ? [
        { label: 'Appellations', value: joinList(company.appellations), icon: 'leaf' },
        { label: 'Cépages', value: joinList(company.grapeVarieties), icon: 'grape' },
        { label: 'Surface viticole', value: formatNumber(company.surfaceHa, 'ha'), icon: 'map' },
        { label: 'Volume annuel', value: formatNumber(company.annualVolume, 'hl/an'), icon: 'scale' },
        { label: 'Produits recherchés', value: joinList(company.soughtProducts), icon: 'cart' },
        { label: 'Volume recherché', value: fallback(company.soughtVolume), icon: 'scale' },
      ]
    : [];
  $: sellerProfileItems = [
    { label: 'Interlocuteur', value: creatorDisplayName, icon: 'user' },
    { label: 'Compte vendeur', value: fallback(annonce?.creator?.username), icon: 'mail' },
    { label: 'Entreprise', value: fallback(company?.name), icon: 'building' },
    { label: 'Dernière mise à jour', value: formatDate(company?.updatedAt || annonce?.updatedAt), icon: 'calendar' },
  ];
  $: sidebarItems = [
    { label: 'Vendeur', value: sellerName, icon: 'building' },
    { label: 'Statut entreprise', value: formatCompanyStatus(company?.status), icon: 'shield' },
    { label: 'SIRET', value: fallback(company?.siret), icon: 'hash' },
    { label: 'Mise à jour', value: formatDate(annonce?.updatedAt || annonce?.createdAt), icon: 'clock' },
  ];
  $: annonceDocuments = annonce?.documents ?? [];

  onMount(() => {
    loadDetail();
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
      if (currentUser) user.setUser(currentUser);
      selectedImage = annonce.images?.[0] ?? '';
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors du chargement de l'annonce.";
    } finally {
      loading = false;
    }
  }

  function showImage(offset: number) {
    if (!galleryImages.length) return;
    const current = selectedIndex >= 0 ? selectedIndex : 0;
    const next = (current + offset + galleryImages.length) % galleryImages.length;
    selectedImage = galleryImages[next];
  }

  async function contactSeller() {
    if (!annonce) return;
    contactLoading = true;
    contactError = '';

    try {
      const conversation = await ConversationAPI.create(annonce.id);
      await goto(`/dashboard/conversations/${conversation.id}`);
    } catch (e) {
      contactError = e instanceof Error ? e.message : 'Impossible de contacter le vendeur.';
    } finally {
      contactLoading = false;
    }
  }

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

  async function confirmMyDelivery() {
    if (!myActiveOrder || (myActiveOrder.status !== 'PAID' && myActiveOrder.status !== 'SHIPPED')) return;
    receiptLoading = true;
    contactError = '';

    try {
      await PaymentAPI.confirmDelivery(myActiveOrder.id);
      await loadDetail();
    } catch (e) {
      contactError = e instanceof Error ? e.message : 'Impossible de valider la réception.';
    } finally {
      receiptLoading = false;
    }
  }

  function orderStatusLabel(status: OrderStatus) {
    const map: Record<OrderStatus, string> = {
      PENDING: 'En attente de paiement',
      PAID: 'Payée',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Terminée',
      CANCELED: 'Annulée',
      FAILED: 'Échouée',
    };

    return map[status];
  }

  function orderStatusClass(status: OrderStatus) {
    if (status === 'PAID' || status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
    if (status === 'SHIPPED') return 'bg-blue-50 text-blue-700 ring-blue-200/60';
    if (status === 'FAILED' || status === 'CANCELED') return 'bg-red-50 text-red-700 ring-red-200/60';
    return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  }

  function formatDate(date?: string) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  }

  function fallback(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned || 'Non renseigné';
  }

  function joinValues(values: Array<string | null | undefined>, separator = ', ') {
    const cleaned = values.map((value) => value?.trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(separator) : 'Non renseigné';
  }

  function joinList(values?: string[] | null) {
    const cleaned = values?.map((value) => value.trim()).filter(Boolean) ?? [];
    return cleaned.length ? cleaned.join(', ') : 'Non renseigné';
  }

  function formatNumber(value?: number | null, suffix = '') {
    if (value === null || value === undefined) return 'Non renseigné';
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
    return suffix ? `${formatted} ${suffix}` : formatted;
  }

  function formatCompanyType(type?: string | null) {
    const map: Record<string, string> = {
      EARL: 'EARL',
      GAEC: 'GAEC',
      SAS: 'SAS',
      SARL: 'SARL',
      COOPERATIVE: 'Coopérative',
      NEGOCE: 'Négoce',
      OTHER: 'Autre',
    };

    return type ? map[type] ?? type : 'Non renseigné';
  }

  function formatCompanyStatus(status?: string | null) {
    if (status === 'VERIFIED') return 'Entreprise vérifiée';
    if (status === 'REJECTED') return 'Vérification refusée';
    if (status === 'PENDING') return 'Vérification en attente';
    return 'Non renseigné';
  }

  function companyStatusClass(status?: string | null) {
    if (status === 'VERIFIED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/70';
    if (status === 'REJECTED') return 'bg-red-50 text-red-700 ring-red-200/70';
    return 'bg-amber-50 text-amber-700 ring-amber-200/70';
  }

  function formatCompanyLocation(entreprise: NonNullable<Annonce['entreprise']>) {
    return [
      entreprise.addressLine1,
      entreprise.addressLine2,
      joinValues([entreprise.postalCode, entreprise.city], ' '),
      entreprise.department,
      entreprise.region,
      entreprise.country,
    ]
      .filter((value) => value && value !== 'Non renseigné')
      .join(', ');
  }

  function documentDisplayName(documentItem: DocumentItem) {
    return documentItem.label || documentItem.originalName || 'Document';
  }

  function documentVisibilityLabel(visibility?: DocumentVisibility | null) {
    return visibility === 'BUYER_ONLY' ? 'Réservé à l’acheteur' : 'Visible par tous';
  }

  function documentVisibilityClass(visibility?: DocumentVisibility | null) {
    if (visibility === 'BUYER_ONLY') return 'bg-amber-50 text-amber-700 ring-amber-200/70';
    return 'bg-violet-50 text-violet-700 ring-violet-200/70';
  }

  function formatFileSize(size?: number) {
    if (!size) return '';
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

</script>

<svelte:head>
  <title>{annonce ? `${annonce.title} - VitiLink` : 'Annonce - VitiLink'}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
  {#if loading}
    <LoadingState
      title="Chargement de l’annonce"
      text="Nous récupérons les photos, les détails du lot et le dossier entreprise."
    />
  {:else if error}
    <Alert type="error" message={error} />
  {:else if annonce}
    <nav class="mb-5 flex items-center gap-2 text-sm text-zinc-500">
      <a href="/dashboard/marche" class="font-medium text-violet-800 transition hover:text-violet-950">Annonces</a>
      <span>/</span>
      <span class="truncate text-zinc-700">{annonce.title}</span>
    </nav>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="space-y-6">
        <section class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
          <div class="relative bg-[#24152f]">
            {#if hasImages}
              <img
                src={visibleImage}
                alt={annonce.title}
                class="aspect-[4/3] w-full object-cover sm:aspect-[16/10] xl:aspect-[16/8]"
              />
            {:else}
              <img
                src="/assets/images/header.jpg"
                alt=""
                class="aspect-[4/3] w-full object-cover opacity-90 sm:aspect-[16/10] xl:aspect-[16/8]"
              />
            {/if}

            <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#24152f]/70 via-transparent to-[#24152f]/25"></div>

            <div class="absolute left-4 top-4 flex flex-wrap gap-2">
              {#if annonce.productType}
                <span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#24152f] shadow-sm">
                  {annonce.productType}
                </span>
              {/if}
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(annonce.status)}`}>
                {statusLabel(annonce.status)}
              </span>
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${purchaseStatusClass(annonce)}`}>
                {purchaseStatusLabel(annonce)}
              </span>
            </div>

            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
              <div class="min-w-0">
                <div class="text-xs font-medium text-white/70">{hasImages ? `Image ${(selectedIndex >= 0 ? selectedIndex : 0) + 1} / ${galleryImages.length}` : 'Photo à venir'}</div>
                <div class="mt-1 truncate text-lg font-semibold">{sellerName}</div>
              </div>

            </div>

            {#if galleryImages.length > 1}
              <button
                type="button"
                on:click={() => showImage(-1)}
                class="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-semibold text-[#24152f] shadow-sm transition hover:bg-white"
                aria-label="Image précédente"
              >
                ‹
              </button>
              <button
                type="button"
                on:click={() => showImage(1)}
                class="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl font-semibold text-[#24152f] shadow-sm transition hover:bg-white"
                aria-label="Image suivante"
              >
                ›
              </button>
            {/if}
          </div>

          {#if galleryImages.length > 1}
            <div class="flex gap-3 overflow-x-auto border-t border-violet-100 bg-[#fbfaf8] p-4">
              {#each galleryImages as path, index}
                <button
                  type="button"
                  on:click={() => (selectedImage = path)}
                  class={`h-20 w-24 shrink-0 overflow-hidden rounded-lg border bg-white transition sm:h-24 sm:w-32 ${
                    selectedImage === path ? 'border-violet-500 ring-4 ring-violet-100' : 'border-violet-100 hover:border-violet-300'
                  }`}
                  aria-label={`Afficher l'image ${index + 1}`}
                >
                  <img src={imageUrl(path)} alt={annonce.title} class="h-full w-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </section>

        <section class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
          <div class="border-b border-violet-100 bg-[#fbfaf8] px-5 py-5 sm:px-6">
            <div class="flex flex-wrap gap-2">
              {#if annonce.productType}
                <span class="badge-soft">{annonce.productType}</span>
              {/if}
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClass(annonce.status)}`}>
                {statusLabel(annonce.status)}
              </span>
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${purchaseStatusClass(annonce)}`}>
                {purchaseStatusLabel(annonce)}
              </span>
            </div>

            <div class="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div class="min-w-0">
                <h1 class="text-3xl font-semibold tracking-tight text-[#24152f]">{annonce.title}</h1>
                <p class="mt-2 text-sm text-zinc-500">{sellerName} · {location || 'Localisation à préciser'}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                <div class="rounded-lg border border-violet-100 bg-white px-4 py-3">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Prix du lot</div>
                  <div class="mt-1 text-xl font-semibold text-[#24152f]">{formatPrice(annonce.price)}</div>
                </div>
                <div class="rounded-lg border border-violet-100 bg-white px-4 py-3">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Volume</div>
                  <div class="mt-1 text-xl font-semibold text-[#24152f]">{formatVolume(annonce)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <article class="rounded-lg border border-violet-100 bg-white p-5">
              <div class="flex items-start gap-3">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-800 ring-1 ring-violet-100">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                  </svg>
                </span>
                <div>
                  <h2 class="text-base font-semibold text-[#24152f]">Description de l’offre</h2>
                  <p class="mt-1 text-sm text-zinc-500">Le contexte donné par le vendeur pour comprendre le lot.</p>
                </div>
              </div>

              {#if annonce.description}
                <p class="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600">{annonce.description}</p>
              {:else}
                <p class="mt-5 text-sm leading-7 text-zinc-500">Le vendeur n'a pas encore ajouté de description détaillée pour cette annonce.</p>
              {/if}
            </article>

            <DetailGroup
              title="Points clés"
              description="Les informations à vérifier avant de contacter le vendeur."
              icon="scale"
              items={infoItems}
              variant="soft"
            />
          </div>

          <div class="border-t border-violet-100 px-5 py-5 sm:px-6">
            <div class="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <DetailGroup
                title="Conditions"
                description="Cadre de l’offre et disponibilité du lot."
                icon="shield"
                items={conditionItems}
              />

              <div class="rounded-lg border border-violet-100 bg-white p-4 sm:p-5">
                <div class="flex items-start gap-3">
                  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fbfaf8] text-violet-800 ring-1 ring-violet-100">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-base font-semibold text-[#24152f]">Certifications et garanties</h3>
                    <p class="mt-1 text-sm leading-6 text-zinc-500">Les éléments déclarés par le vendeur sur cette annonce.</p>
                  </div>
                </div>

                {#if annonce.certifications?.length}
                  <div class="mt-4 flex flex-wrap gap-2">
                    {#each annonce.certifications as certification}
                      <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {certification}
                      </span>
                    {/each}
                  </div>
                {:else}
                  <p class="mt-4 text-sm leading-6 text-zinc-500">Aucune certification n’a été renseignée pour le moment.</p>
                {/if}
              </div>
            </div>
          </div>

          <div class="border-t border-violet-100 px-5 py-5 sm:px-6">
            <div class="rounded-lg border border-violet-100 bg-white p-4 sm:p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex items-start gap-3">
                  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fbfaf8] text-violet-800 ring-1 ring-violet-100">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 3.5h7l3 3V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14 3.5V7h3M9 12h6M9 16h4" />
                    </svg>
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-base font-semibold text-[#24152f]">Documents de l’annonce</h3>
                    <p class="mt-1 text-sm leading-6 text-zinc-500">
                      Les documents réservés sont affichés uniquement après achat du lot, ou au vendeur.
                    </p>
                  </div>
                </div>
                <span class="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                  {annonceDocuments.length} document{annonceDocuments.length > 1 ? 's' : ''}
                </span>
              </div>

              {#if annonceDocuments.length}
                <div class="mt-4 grid gap-3 md:grid-cols-2">
                  {#each annonceDocuments as documentItem (documentItem.id)}
                    <article class="flex min-w-0 flex-col gap-4 rounded-2xl border border-violet-100 bg-[#fbfaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div class="min-w-0">
                        <div class="truncate text-sm font-semibold text-[#24152f]">{documentDisplayName(documentItem)}</div>
                        <div class="mt-2 flex flex-wrap items-center gap-2">
                          <span class={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${documentVisibilityClass(documentItem.visibility)}`}>
                            {documentVisibilityLabel(documentItem.visibility)}
                          </span>
                          {#if documentItem.mimeType}
                            <span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 ring-1 ring-zinc-100">
                              {documentItem.mimeType.replace('application/', '').replace('image/', '').toUpperCase()}
                            </span>
                          {/if}
                          {#if documentItem.sizeBytes}
                            <span class="text-xs text-zinc-500">{formatFileSize(documentItem.sizeBytes)}</span>
                          {/if}
                        </div>
                      </div>

                      <a href={DocumentAPI.fileUrl(documentItem.url)} target="_blank" rel="noopener noreferrer" class="btn-secondary shrink-0">
                        Ouvrir
                      </a>
                    </article>
                  {/each}
                </div>
              {:else}
                <p class="mt-4 rounded-2xl bg-[#fbfaf8] px-4 py-3 text-sm leading-6 text-zinc-500 ring-1 ring-violet-100">
                  Aucun document n’est visible pour cette annonce à ce stade.
                </p>
              {/if}
            </div>
          </div>
        </section>

        {#if isMine && sellerOrders.length > 0}
          <section class="rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-[#24152f]">Commandes reçues</h2>
                <p class="mt-1 text-sm text-zinc-500">{sellerOrders.length} commande{sellerOrders.length > 1 ? 's' : ''} liée{sellerOrders.length > 1 ? 's' : ''} à cette annonce.</p>
              </div>
            </div>

            <div class="mt-4 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100">
              {#each sellerOrders as order}
                <div class="flex flex-col gap-3 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div class="text-sm font-semibold text-zinc-900">{order.buyer?.username ?? 'Acheteur'}</div>
                    <div class="mt-1 text-xs text-zinc-500">
                      Lot complet · {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-3">
                    <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${orderStatusClass(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <span class="text-sm font-semibold text-[#24152f]">{formatPrice(order.totalAmount / 100)}</span>
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        <section class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
          <div class="relative isolate bg-[#181121] px-5 py-6 text-white sm:px-6">
            <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(139,92,246,0.38),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.18),transparent_32%)]"></div>
            <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div class="flex min-w-0 gap-4">
                <div class="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/10 text-violet-100 ring-1 ring-white/10">
                  <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 20V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V20M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01M16 10h1.5A2.5 2.5 0 0 1 20 12.5V20" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/75">Dossier entreprise</p>
                  <h2 class="mt-2 break-words text-2xl font-semibold [overflow-wrap:break-word]">{sellerName}</h2>
                  <p class="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                    Informations administratives, localisation et production du profil professionnel rattaché à cette annonce.
                  </p>
                </div>
              </div>

              {#if company}
                <span class={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${companyStatusClass(company.status)}`}>
                  <span class="h-2 w-2 rounded-full bg-current"></span>
                  {formatCompanyStatus(company.status)}
                </span>
              {/if}
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              {#each sellerProfileItems as item}
                <div class="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{item.label}</div>
                  <div class="mt-1 break-words text-sm font-semibold leading-5 text-white [overflow-wrap:break-word]">{item.value || '—'}</div>
                </div>
              {/each}
            </div>
          </div>

          {#if company}
            <div class="space-y-7 p-5 sm:p-6">
              <DetailGroup
                title="Identité administrative"
                description={company.verifiedAt
                  ? `Entreprise vérifiée le ${formatDate(company.verifiedAt)}.`
                  : "Les éléments légaux utilisés pour qualifier l'entreprise vendeuse."}
                icon="file"
                items={companyIdentityItems}
                variant="soft"
              />

              <div class="grid gap-5 xl:grid-cols-2">
                <DetailGroup
                  title="Localisation de l’entreprise"
                  description="Adresse, région et repères utiles pour anticiper la logistique."
                  icon="pin"
                  items={companyLocationItems}
                />

                <DetailGroup
                  title="Vigne, production et besoins"
                  description="Données viticoles pour comprendre le contexte du producteur."
                  icon="sprout"
                  items={vineyardItems}
                />
              </div>

              {#if company.verificationNote}
                <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div class="text-sm font-semibold text-amber-950">Note de vérification</div>
                  <p class="mt-2 text-sm leading-6 text-amber-900">{company.verificationNote}</p>
                </div>
              {/if}
            </div>
          {:else}
            <div class="p-5 sm:p-6">
              <p class="rounded-lg bg-[#fbfaf8] p-4 text-sm leading-6 text-zinc-500 ring-1 ring-violet-100">
                Aucune information entreprise n’est rattachée à cette annonce.
              </p>
            </div>
          {/if}
        </section>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <section class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
          <div class="bg-[#24152f] px-5 py-5 text-white">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/75">Synthèse de l'offre</div>
            <div class="mt-3 text-3xl font-semibold tracking-tight">{formatPrice(annonce.price)}</div>
            <div class="mt-2 text-sm text-white/70">{formatVolume(annonce)}</div>
          </div>

          <div class="space-y-4 p-5">
            <div class="divide-y divide-violet-100 rounded-lg border border-violet-100 bg-[#fbfaf8] px-4">
              {#each sidebarItems as item}
                <DetailRow label={item.label} value={item.value} icon={item.icon} />
              {/each}
            </div>

            <div class="grid gap-3">
              {#if isMine}
                <a href={`/dashboard/mes-annonces/${annonce.id}/edit`} class="btn-primary w-full">Modifier l'annonce</a>
                <a href="/dashboard/mes-annonces" class="btn-secondary w-full">Retour à mes annonces</a>
              {:else}
                <button
                  type="button"
                  on:click={contactSeller}
                  disabled={contactLoading}
                  class="btn-primary w-full disabled:opacity-50"
                >
                  {contactLoading ? 'Connexion...' : 'Contacter le producteur'}
                </button>

                {#if canBuy}
                  <a href={`/dashboard/checkout/${annonce.id}`} class="btn-secondary w-full">Acheter le lot complet</a>
                {:else if myActiveOrder?.status === 'PENDING' && !isSold}
                  <a href={`/dashboard/checkout/${annonce.id}`} class="btn-secondary w-full">Reprendre le paiement</a>
                  <button
                    type="button"
                    on:click={cancelMyOrder}
                    disabled={cancelLoading}
                    class="inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancelLoading ? 'Annulation...' : 'Annuler la commande'}
                  </button>
                {:else if myActiveOrder?.status === 'PAID' || myActiveOrder?.status === 'SHIPPED'}
                  <a href="/dashboard/commandes" class={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ring-1 ${orderStatusClass(myActiveOrder.status)}`}>
                    Ma commande · {orderStatusLabel(myActiveOrder.status)}
                  </a>
                  <button
                    type="button"
                    on:click={confirmMyDelivery}
                    disabled={receiptLoading}
                    class="btn-primary w-full disabled:opacity-50"
                  >
                    {receiptLoading ? 'Validation...' : 'Valider la réception'}
                  </button>
                {:else if myActiveOrder?.status === 'DELIVERED'}
                  <a href="/dashboard/commandes" class={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold ring-1 ${orderStatusClass(myActiveOrder.status)}`}>
                    Commande terminée
                  </a>
                {:else if isInProgress}
                  <span class="inline-flex w-full items-center justify-center rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-200/60">
                    Annonce en cours d'achat
                  </span>
                {:else if isSold}
                  <span class="inline-flex w-full items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500 ring-1 ring-zinc-200">
                    Annonce payée
                  </span>
                {:else}
                  <span class="rounded-lg bg-zinc-50 px-4 py-3 text-sm font-medium leading-6 text-zinc-500 ring-1 ring-zinc-100">
                    L'achat direct n'est pas disponible pour cette annonce. Contactez le vendeur pour avancer.
                  </span>
                {/if}

                <a href="/dashboard/marche" class="btn-secondary w-full">Retour aux annonces</a>
              {/if}
            </div>

            {#if contactError}
              <p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{contactError}</p>
            {/if}
          </div>
        </section>

        <section class="rounded-lg border border-violet-200 bg-violet-50 p-5">
          <div class="text-sm font-semibold text-[#24152f]">À vérifier avant échange</div>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-violet-950/70">
            <li>Volume, localisation et disponibilité.</li>
            <li>Conditions de retrait ou de livraison.</li>
            <li>Documents et analyses utiles à la transaction.</li>
          </ul>
        </section>
      </aside>
    </div>

  {/if}
</div>
