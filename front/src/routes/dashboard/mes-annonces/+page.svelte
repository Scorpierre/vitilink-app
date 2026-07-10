<script lang="ts">
  import { onMount } from 'svelte';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { Annonce } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
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
    <section class="relative isolate overflow-hidden rounded-lg border border-white bg-[#24152f] p-5 text-white shadow-[0_28px_80px_rgba(36,21,47,0.18)] sm:p-7 lg:p-8">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(139,92,246,0.42),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(34,197,94,0.15),transparent_30%)]"></div>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/75">Espace vendeur</p>
          <h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Mes annonces</h1>
          <p class="mt-3 text-sm leading-7 text-white/68">
            Suivez vos publications, vos lots en ligne et les offres à retravailler avant de les remettre sur le marché.
          </p>
        </div>

        <a
          href="/dashboard/mes-annonces/nouveau"
          class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#24152f] shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"
        >
          Créer une annonce
        </a>
      </div>

      <div class="mt-7 grid gap-3 md:grid-cols-3">
        <div class="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
          <div class="text-2xl font-semibold">{annonces.length}</div>
          <div class="mt-1 text-xs font-medium text-white/58">Annonces créées</div>
        </div>
        <div class="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
          <div class="text-2xl font-semibold text-emerald-200">{publishedCount}</div>
          <div class="mt-1 text-xs font-medium text-white/58">En ligne</div>
        </div>
        <div class="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
          <div class="text-2xl font-semibold text-violet-100">{archivedCount}</div>
          <div class="mt-1 text-xs font-medium text-white/58">Archivées</div>
        </div>
      </div>
    </section>

    <Alert type="error" message={error} />
    <Alert type="success" message={success} />

    {#if loading}
      <LoadingState
        title="Chargement de vos annonces"
        text="Nous préparons vos offres publiées, brouillons et archives."
      />
    {:else}
      <section class="rounded-lg border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
        <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-[#24152f]">Vos offres</h2>
            <p class="mt-1 text-sm text-zinc-500">Gérez les annonces visibles sur le marché et les informations liées aux lots.</p>
          </div>
        </div>
        <AnnonceList {annonces} mode="mine" />
      </section>
    {/if}
  </div>
</div>
