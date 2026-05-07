<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { Annonce, CreateAnnonceBody } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import PageHeader from '$lib/components/utils/PageHeader.svelte';
  import AnnonceForm from '$lib/components/annonces/AnnonceForm.svelte';

  let annonce: Annonce | null = null;
  let loading = true;
  let submitting = false;
  let error = '';

  onMount(loadAnnonce);

  async function loadAnnonce() {
    loading = true;
    error = '';

    try {
      const data = await AnnonceAPI.getOne($page.params.id);
      annonce = data.result;
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors du chargement de l'annonce.";
    } finally {
      loading = false;
    }
  }

  async function updateAnnonce(body: CreateAnnonceBody) {
    if (!annonce) return;

    submitting = true;
    error = '';

    try {
      await AnnonceAPI.update(annonce.id, body);
      goto(`/home/annonces/${annonce.id}`);
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors de la mise à jour de l'annonce.";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <PageHeader
      eyebrow="Mes annonces"
      title="Modifier l’annonce"
      subtitle="Mettez à jour les informations visibles sur la marketplace."
    />

    <Alert type="error" message={error} />

    {#if loading}
      <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement de l’annonce...</div>
    {:else if annonce}
      <AnnonceForm
        initial={annonce}
        {submitting}
        submitLabel="Enregistrer les modifications"
        submittingLabel="Enregistrement..."
        onSubmit={updateAnnonce}
      />
    {/if}
  </div>
</div>
