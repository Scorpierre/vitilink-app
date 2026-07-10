<script lang="ts">
  import { onMount } from 'svelte';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { Annonce } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import AnnonceFilters from '$lib/components/annonces/AnnonceFilters.svelte';
  import AnnonceList from '$lib/components/annonces/AnnonceList.svelte';
  import { formatPrice, formatVolume, getPurchaseStatus, purchaseStatusLabel } from '$lib/utils/annonce';

  let annonces: Annonce[] = [];
  let loading = true;
  let error = '';
  let q = '';
  let region = '';
  let productType = '';
  let availability = '';

  onMount(loadAnnonces);

  $: normalizedQuery = q.trim().toLowerCase();
  $: filteredAnnonces = annonces.filter((annonce) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        annonce.title,
        annonce.description,
        annonce.city,
        annonce.region,
        annonce.productType,
        annonce.entreprise?.name
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));

    const matchesRegion = !region || annonce.region === region;
    const matchesType = !productType || annonce.productType === productType;
    const matchesAvailability = !availability || getPurchaseStatus(annonce) === availability;

    return matchesQuery && matchesRegion && matchesType && matchesAvailability;
  });
  $: availableCount = annonces.filter((annonce) => getPurchaseStatus(annonce) === 'AVAILABLE').length;
  $: regionCount = new Set(annonces.map((annonce) => annonce.region).filter(Boolean)).size;
  $: photoCount = annonces.filter((annonce) => annonce.images?.length).length;
  $: highlightedAnnonce = filteredAnnonces[0] ?? annonces[0] ?? null;
  $: activeFilterCount = [q.trim(), region, productType, availability].filter(Boolean).length;
  $: topRegions = buildTopRegions(filteredAnnonces);

  async function loadAnnonces() {
    loading = true;
    error = '';

    try {
      const data = await AnnonceAPI.listMarketplace();
      annonces = data.result ?? [];
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors du chargement des annonces.';
    } finally {
      loading = false;
    }
  }

  function buildTopRegions(items: Annonce[]) {
    const counts = new Map<string, number>();

    items.forEach((annonce) => {
      if (!annonce.region) return;
      counts.set(annonce.region, (counts.get(annonce.region) ?? 0) + 1);
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }
</script>

<div class="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
  <div class="space-y-6">
    <section class="relative isolate overflow-hidden rounded-lg border border-white bg-[#24152f] shadow-[0_28px_80px_rgba(36,21,47,0.18)]">
      <img
        src="/assets/images/header.jpg"
        alt=""
        class="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div class="absolute inset-0 -z-10 bg-[linear-gradient(108deg,rgba(36,21,47,0.96)_0%,rgba(36,21,47,0.82)_48%,rgba(91,45,242,0.34)_100%)]"></div>

      <div class="grid gap-8 px-5 py-7 text-white sm:px-7 sm:py-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-9">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            Marketplace VitiLink
          </div>

          <h1 class="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Trouver le bon lot viticole, sans perdre le fil.
          </h1>

          <p class="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Parcourez les offres de raisin, moût, jus et produits viticoles avec les informations utiles dès la première lecture.
          </p>

          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/dashboard/mes-annonces/nouveau"
              class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#24152f] shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Déposer une annonce
            </a>
            <a
              href="#annonces"
              class="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Voir les offres
            </a>
          </div>
        </div>

        <div class="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-3xl font-semibold tracking-tight">{loading ? '...' : availableCount}</div>
            <div class="mt-1 text-sm font-semibold">Lots disponibles</div>
            <div class="mt-2 text-xs leading-5 text-white/60">{annonces.length} annonce{annonces.length !== 1 ? 's' : ''} chargée{annonces.length !== 1 ? 's' : ''}</div>
          </article>
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-3xl font-semibold tracking-tight">{loading ? '...' : regionCount}</div>
            <div class="mt-1 text-sm font-semibold">Régions</div>
            <div class="mt-2 text-xs leading-5 text-white/60">Répartition issue des annonces</div>
          </article>
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-3xl font-semibold tracking-tight">{loading ? '...' : photoCount}</div>
            <div class="mt-1 text-sm font-semibold">Avec photos</div>
            <div class="mt-2 text-xs leading-5 text-white/60">Visuels fournis par les vendeurs</div>
          </article>
        </div>
      </div>
    </section>

    <AnnonceFilters bind:q bind:region bind:productType bind:availability />
    <Alert type="error" message={error} />

    <section id="annonces" class="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <div class="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-[#24152f]">Offres du marché</h2>
            <p class="mt-1 text-sm text-zinc-500">
              {loading
                ? 'Chargement des annonces...'
                : `${filteredAnnonces.length} résultat${filteredAnnonces.length !== 1 ? 's' : ''}${activeFilterCount ? ` avec ${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''}` : ''}`}
            </p>
          </div>

          {#if topRegions.length}
            <div class="flex flex-wrap gap-2">
              {#each topRegions as [name, count]}
                <span class="rounded-full bg-[#fbfaf8] px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
                  {name} · {count}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <aside class="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
        <div class="text-sm font-semibold text-[#24152f]">Mise en avant</div>
        {#if highlightedAnnonce}
          <a href={`/dashboard/annonces/${highlightedAnnonce.id}`} class="group mt-4 block rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100 transition hover:-translate-y-0.5 hover:bg-violet-50">
            <div class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              {highlightedAnnonce.productType || 'Annonce'}
            </div>
            <div class="mt-2 line-clamp-2 text-sm font-semibold text-[#24152f]">{highlightedAnnonce.title}</div>
            <div class="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <span>{formatVolume(highlightedAnnonce)}</span>
              <span class="font-semibold text-[#24152f]">{formatPrice(highlightedAnnonce.price)}</span>
            </div>
            <div class="mt-3">
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
                {purchaseStatusLabel(highlightedAnnonce)}
              </span>
            </div>
          </a>
        {:else}
          <p class="mt-3 text-sm leading-6 text-zinc-500">La prochaine annonce publiée apparaîtra ici.</p>
        {/if}
      </aside>
    </section>

    {#if loading}
      <LoadingState
        title="Chargement du marché"
        text="Nous préparons les annonces disponibles avec leurs volumes, prix et localisations."
      />
    {:else}
      <AnnonceList annonces={filteredAnnonces} mode="market" />
    {/if}
  </div>
</div>
