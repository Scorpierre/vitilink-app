<script lang="ts">
  import { onMount } from 'svelte';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { Annonce } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import PageHeader from '$lib/components/utils/PageHeader.svelte';
  import AnnonceList from '$lib/components/annonces/AnnonceList.svelte';

  let annonces: Annonce[] = [];
  let loading = true;
  let error = '';
  let success = '';

  $: publishedCount = annonces.filter((annonce) => annonce.status === 'PUBLISHED').length;
  $: archivedCount = annonces.filter((annonce) => annonce.status === 'ARCHIVED').length;

  onMount(loadMine);

  async function loadMine() {
    loading = true;
    error = '';

    try {
      const data = await AnnonceAPI.listMine();
      annonces = data.result ?? [];
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors du chargement de vos annonces.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <PageHeader
      eyebrow="Espace vendeur"
      title="Mes annonces"
      subtitle="Suivez vos publications et préparez rapidement de nouvelles offres pour la marketplace."
      actionHref="/home/mes-annonces/new"
      actionLabel="Créer une annonce"
    />

    <div class="grid gap-4 md:grid-cols-3">
      <div class="card p-5">
        <div class="text-2xl font-semibold text-zinc-950">{annonces.length}</div>
        <div class="mt-1 text-sm text-zinc-500">Annonces créées</div>
      </div>
      <div class="card p-5">
        <div class="text-2xl font-semibold text-emerald-700">{publishedCount}</div>
        <div class="mt-1 text-sm text-zinc-500">En ligne</div>
      </div>
      <div class="card p-5">
        <div class="text-2xl font-semibold text-zinc-600">{archivedCount}</div>
        <div class="mt-1 text-sm text-zinc-500">Archivées</div>
      </div>
    </div>

    <Alert type="error" message={error} />
    <Alert type="success" message={success} />

    {#if loading}
      <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement de vos annonces...</div>
    {:else}
      <AnnonceList {annonces} mode="mine" />
    {/if}
  </div>
</div>
