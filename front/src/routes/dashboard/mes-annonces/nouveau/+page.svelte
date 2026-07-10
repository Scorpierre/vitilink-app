<script lang="ts">
  import { goto } from '$app/navigation';
  import { AnnonceAPI } from '$lib/api/annonce';
  import type { CreateAnnonceBody } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import AnnonceForm from '$lib/components/annonces/AnnonceForm.svelte';

  const highlights = [
    { value: '6 étapes', label: 'pour structurer le dépôt' },
    { value: '1 photo min.', label: 'obligatoire pour publier' },
    { value: 'Documents', label: 'publics ou réservés acheteur' }
  ];

  let submitting = false;
  let error = '';

  async function createAnnonce(body: CreateAnnonceBody) {
    submitting = true;
    error = '';

    try {
      await AnnonceAPI.create(body);
      goto('/dashboard/mes-annonces');
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors de la création de l'annonce.";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
  <div class="space-y-8">
    <section class="overflow-hidden rounded-[2rem] bg-[#181121] text-white shadow-[0_24px_70px_rgba(24,17,33,0.18)]">
      <div class="grid lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="relative isolate px-5 py-8 sm:px-7 lg:px-9">
          <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_12%,rgba(139,92,246,0.42),transparent_34%),radial-gradient(circle_at_72%_18%,rgba(34,197,94,0.18),transparent_30%)]"></div>

          <a href="/dashboard/mes-annonces" class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/15">
            Retour aux annonces
          </a>

          <div class="mt-8 max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/80">Nouvelle annonce</p>
            <h1 class="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Déposer une annonce claire, complète et lisible.</h1>
            <p class="mt-4 text-base leading-8 text-white/70">
              Suivez le fil conducteur : lot, conditions, photos, documents, localisation puis éléments de confiance.
              L’objectif est de donner envie de contacter rapidement, sans perdre les informations clés.
            </p>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            {#each highlights as item}
              <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p class="text-lg font-semibold">{item.value}</p>
                <p class="mt-1 text-xs leading-5 text-white/55">{item.label}</p>
              </div>
            {/each}
          </div>
        </div>

        <div class="relative min-h-64 lg:min-h-full">
          <img src="/assets/images/image-recolte.jpeg" alt="" class="absolute inset-0 h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#181121] via-[#181121]/25 to-transparent lg:bg-gradient-to-r lg:from-[#181121] lg:via-[#181121]/30 lg:to-transparent"></div>
          <div class="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p class="text-sm font-semibold">Annonce guidée</p>
            <p class="mt-1 text-xs leading-5 text-white/65">Le résumé se met à jour pendant la saisie pour garder une offre cohérente.</p>
          </div>
        </div>
      </div>
    </section>

    <Alert type="error" message={error} />
    <AnnonceForm {submitting} minImages={1} onSubmit={createAnnonce} />
  </div>
</div>
