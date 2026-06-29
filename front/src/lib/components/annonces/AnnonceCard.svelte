<script lang="ts">
  import type { Annonce } from '$lib/types';
  import { formatPrice, formatVolume, imageUrl, statusClass, statusLabel } from '$lib/utils/annonce';
  import AnnonceMeta from './AnnonceMeta.svelte';

  export let annonce: Annonce;
  export let mode: 'market' | 'mine' = 'market';

  $: detailHref = `/home/annonces/${annonce.id}`;
  $: primaryImage = annonce.images?.[0] ? imageUrl(annonce.images[0]) : '';
  $: location = annonce.location || [annonce.city, annonce.region].filter(Boolean).join(', ');
</script>

<article class="card card-hover overflow-hidden">
  <a href={detailHref} class="block focus:outline-none focus:ring-4 focus:ring-violet-200">
    <div class="aspect-[16/10] bg-[rgb(var(--primary-50))]">
      {#if primaryImage}
        <img src={primaryImage} alt={annonce.title} class="h-full w-full object-cover" />
      {:else}
        <div class="flex h-full w-full items-center justify-center text-sm font-medium text-[rgb(var(--primary-700))]">
          VitiLink
        </div>
      {/if}
    </div>

    <div class="p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap gap-2">
            {#if annonce.productType}
              <span class="badge-soft">{annonce.productType}</span>
            {/if}
            {#if mode === 'mine'}
              <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClass(annonce.status)}`}>
                {statusLabel(annonce.status)}
              </span>
              {#if annonce._count?.orders}
                <span class="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200/60">
                  {annonce._count.orders} commande{annonce._count.orders > 1 ? 's' : ''}
                </span>
              {/if}
            {/if}
          </div>
          <h2 class="mt-3 line-clamp-2 text-lg font-semibold text-zinc-950">{annonce.title}</h2>
        </div>
        <div class="shrink-0 text-right text-sm font-semibold text-zinc-950">{formatPrice(annonce.price)}</div>
      </div>

      {#if annonce.description}
        <p class="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{annonce.description}</p>
      {/if}

      <div class="mt-5 grid grid-cols-2 gap-4">
        <AnnonceMeta label="Volume" value={formatVolume(annonce)} />
        <AnnonceMeta label="Localisation" value={location} />
        <AnnonceMeta label="Timing" value={annonce.availabilityTiming || 'À convenir'} />
        <AnnonceMeta label="Entreprise" value={annonce.entreprise?.name || '—'} />
      </div>

      {#if annonce.certifications?.length}
        <div class="mt-5 flex flex-wrap gap-2">
          {#each annonce.certifications.slice(0, 4) as certification}
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {certification}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </a>

  <div class="flex items-center gap-3 border-t border-[rgb(var(--border))] p-4">
    <a href={detailHref} class="btn-secondary flex-1">Voir le détail</a>
    {#if mode === 'mine'}
      <a href={`/home/mes-annonces/${annonce.id}/edit`} class="btn-primary flex-1">Modifier</a>
    {/if}
  </div>
</article>
