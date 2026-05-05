<script lang="ts">
  import type { Annonce } from '$lib/types';
  import AnnonceCard from './AnnonceCard.svelte';
  import EmptyState from '$lib/components/utils/EmptyState.svelte';

  export let annonces: Annonce[] = [];
  export let mode: 'market' | 'mine' = 'market';
</script>

{#if annonces.length}
  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {#each annonces as annonce}
      <AnnonceCard {annonce} {mode} />
    {/each}
  </div>
{:else}
  <EmptyState
    title={mode === 'mine' ? 'Aucune annonce créée' : 'Aucune annonce disponible'}
    text={mode === 'mine'
      ? 'Déposez votre première annonce pour rendre vos lots visibles sur la marketplace.'
      : 'Les annonces publiées par les professionnels apparaîtront ici.'}
    actionHref={mode === 'mine' ? '/home/mes-annonces/new' : ''}
    actionLabel={mode === 'mine' ? 'Créer une annonce' : ''}
  />
{/if}
