<script lang="ts">
  import { goto } from '$app/navigation';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { CreateAnnonceBody } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import PageHeader from '$lib/components/utils/PageHeader.svelte';
  import AnnonceForm from '$lib/components/annonces/AnnonceForm.svelte';

  let submitting = false;
  let error = '';

  async function createAnnonce(body: CreateAnnonceBody) {
    submitting = true;
    error = '';

    try {
      await AnnonceAPI.create(body);
      goto('/home/mes-annonces');
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors de la création de l'annonce.";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <PageHeader
      eyebrow="Nouvelle annonce"
      title="Déposer une annonce"
      subtitle="Publiez une offre complète avec les informations nécessaires pour qualifier les échanges."
    />

    <Alert type="error" message={error} />
    <AnnonceForm {submitting} onSubmit={createAnnonce} />
  </div>
</div>
