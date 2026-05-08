<script lang="ts">
  import { onMount } from 'svelte';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { Annonce } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import PageHeader from '$lib/components/utils/PageHeader.svelte';
  import AnnonceFilters from '$lib/components/annonces/AnnonceFilters.svelte';
  import AnnonceList from '$lib/components/annonces/AnnonceList.svelte';

  let annonces: Annonce[] = [];
  let loading = true;
  let error = '';
  let q = '';
  let region = '';
  let productType = '';

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

    return matchesQuery && matchesRegion && matchesType;
  });

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
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <PageHeader
      eyebrow="Marketplace"
      title="Annonces disponibles"
      subtitle="Parcourez les offres publiées par les domaines, caves, négoces et partenaires de la filière."
      actionHref="/home/mes-annonces/new"
      actionLabel="Déposer une annonce"
    />

    <AnnonceFilters bind:q bind:region bind:productType />
    <Alert type="error" message={error} />

    {#if loading}
      <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement des annonces...</div>
    {:else}
      <AnnonceList annonces={filteredAnnonces} mode="market" />
    {/if}
  </div>
</div>
