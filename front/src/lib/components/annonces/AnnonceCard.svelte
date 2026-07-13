<script lang="ts">
  import type { Annonce } from '$lib/types';
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
  import AnnonceMeta from './AnnonceMeta.svelte';

  export let annonce: Annonce;
  export let mode: 'market' | 'mine' = 'market';

  $: detailHref = `/dashboard/annonces/${annonce.id}`;
  $: primaryImage = annonce.images?.[0] ? imageUrl(annonce.images[0]) : '';
  $: imageCount = annonce.images?.length ?? 0;
  $: location = annonce.location || [annonce.city, annonce.region].filter(Boolean).join(', ');
  $: certifications = annonce.certifications?.filter(Boolean) ?? [];
  $: company = annonce.entreprise ?? null;
  $: companyLocation = company?.region || company?.city || company?.country || '';
  $: companyStatus =
    !company
      ? 'Entreprise non renseignée'
      : company.status === 'VERIFIED'
      ? 'Entreprise vérifiée'
      : company.status === 'REJECTED'
        ? 'Vérification refusée'
        : 'Vérification en attente';
  $: companyRegistry = company?.siret ? `SIRET ${company.siret}` : company?.siren ? `SIREN ${company.siren}` : '';
  $: currentPurchaseStatus = getPurchaseStatus(annonce);
</script>

{#if mode === 'market'}
  <article class="group overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(36,21,47,0.12)]">
    <a href={detailHref} class="block focus:outline-none focus:ring-4 focus:ring-violet-200">
      <div class="relative aspect-[16/11] overflow-hidden bg-[#24152f]">
        {#if primaryImage}
          <img src={primaryImage} alt={annonce.title} class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        {:else}
          <img src="/assets/images/header.jpg" alt="" class="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04]" />
        {/if}

        <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/80 via-[#24152f]/10 to-transparent"></div>

        <div class="absolute left-4 top-4 flex flex-wrap gap-2">
          {#if annonce.productType}
            <span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#24152f] shadow-sm">
              {annonce.productType}
            </span>
          {/if}
          {#if imageCount}
            <span class="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {imageCount} photo{imageCount > 1 ? 's' : ''}
            </span>
          {:else}
            <span class="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Photo à venir
            </span>
          {/if}
        </div>

        <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div class="min-w-0">
            <div class="text-xs font-medium text-white/70">{annonce.region || annonce.city || 'Localisation à préciser'}</div>
            <div class="mt-1 truncate text-xl font-semibold">{formatPrice(annonce.price)}</div>
          </div>
          <span class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${purchaseStatusClass(annonce)}`}>
            {purchaseStatusLabel(annonce)}
          </span>
        </div>
      </div>

      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              {annonce.entreprise?.name || 'Producteur VitiLink'}
            </p>
            <h2 class="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-[#24152f]">{annonce.title}</h2>
          </div>
        </div>

        {#if annonce.description}
          <p class="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{annonce.description}</p>
        {/if}

        <div class="mt-4 rounded-lg border border-violet-100 bg-violet-50/60 p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-800 ring-1 ring-violet-100">
              {companyStatus}
            </span>
            {#if company?.type}
              <span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 ring-1 ring-violet-100">
                {company.type}
              </span>
            {/if}
          </div>
          <div class="mt-2 text-xs leading-5 text-zinc-500">
            {companyLocation || 'Localisation entreprise à préciser'}
            {#if companyRegistry}
              <span class="text-zinc-300"> · </span>{companyRegistry}
            {/if}
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Volume" value={formatVolume(annonce)} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Timing" value={annonce.availabilityTiming || 'À convenir'} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Localisation" value={location} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Accès" value={annonce.restrictToVerified ? 'Vérifié' : 'Ouvert'} />
          </div>
        </div>

        {#if certifications.length}
          <div class="mt-5 flex flex-wrap gap-2">
            {#each certifications.slice(0, 3) as certification}
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {certification}
              </span>
            {/each}
            {#if certifications.length > 3}
              <span class="rounded-full bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-100">
                +{certifications.length - 3}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    </a>

    <div class="flex items-center justify-between gap-3 border-t border-violet-100 px-5 py-4">
      <span class="text-xs font-medium text-zinc-500">{location || 'France'}</span>
      <a href={detailHref} class="inline-flex items-center gap-2 rounded-lg bg-[#24152f] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-900">
        Voir l'offre
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </a>
    </div>
  </article>
{:else}
  <article class="group overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(48,22,75,0.10)]">
    <a href={detailHref} class="block focus:outline-none focus:ring-4 focus:ring-violet-200">
      <div class="relative aspect-[16/10] overflow-hidden bg-[#24152f]">
        {#if primaryImage}
          <img src={primaryImage} alt={annonce.title} class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        {:else}
          <img src="/assets/images/header.jpg" alt="" class="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.04]" />
        {/if}

        <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/82 via-[#24152f]/15 to-transparent"></div>

        <div class="absolute left-4 top-4 flex flex-wrap gap-2">
          {#if annonce.productType}
            <span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#24152f] shadow-sm">
              {annonce.productType}
            </span>
          {/if}
          <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(annonce.status)}`}>
            {statusLabel(annonce.status)}
          </span>
        </div>

        <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div class="min-w-0">
            <div class="text-xs font-medium text-white/70">{location || 'Localisation à préciser'}</div>
            <div class="mt-1 truncate text-xl font-semibold">{formatPrice(annonce.price)}</div>
          </div>
          {#if currentPurchaseStatus !== 'AVAILABLE'}
            <span class={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${purchaseStatusClass(annonce)}`}>
              {purchaseStatusLabel(annonce)}
            </span>
          {/if}
        </div>
      </div>

      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              {annonce.entreprise?.name || 'Producteur VitiLink'}
            </p>
            <h2 class="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-[#24152f]">{annonce.title}</h2>
          </div>
          {#if annonce._count?.orders}
            <span class="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
              {annonce._count.orders} commande{annonce._count.orders > 1 ? 's' : ''}
            </span>
          {/if}
        </div>

        {#if annonce.description}
          <p class="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{annonce.description}</p>
        {/if}

        <div class="mt-4 rounded-lg border border-violet-100 bg-violet-50/60 p-3">
          <div class="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">Entreprise</div>
          <div class="mt-2 text-sm font-semibold text-[#24152f]">{company?.name || 'Non renseigné'}</div>
          <div class="mt-1 text-xs leading-5 text-zinc-500">
            {companyStatus}
            {#if companyRegistry}
              <span class="text-zinc-300"> · </span>{companyRegistry}
            {/if}
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Volume" value={formatVolume(annonce)} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Localisation" value={location} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Timing" value={annonce.availabilityTiming || 'À convenir'} />
          </div>
          <div class="rounded-lg bg-[#fbfaf8] p-3 ring-1 ring-violet-100">
            <AnnonceMeta label="Entreprise" value={annonce.entreprise?.name || '—'} />
          </div>
        </div>

        {#if certifications.length}
          <div class="mt-5 flex flex-wrap gap-2">
            {#each certifications.slice(0, 4) as certification}
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {certification}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </a>

    <div class="flex items-center gap-3 border-t border-violet-100 p-4">
      <a href={detailHref} class="btn-secondary flex-1 rounded-lg">Voir le détail</a>
      <a href={`/dashboard/mes-annonces/${annonce.id}/edit`} class="btn-primary flex-1 rounded-lg">Modifier</a>
    </div>
  </article>
{/if}
