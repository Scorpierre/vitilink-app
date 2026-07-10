<script lang="ts">
  import { PRODUCT_TYPES, REGIONS } from '$lib/utils/annonce';

  export let q = '';
  export let region = '';
  export let productType = '';
  export let availability = '';

  $: hasFilters = q.trim() || region || productType || availability;

  function resetFilters() {
    q = '';
    region = '';
    productType = '';
    availability = '';
  }
</script>

<div class="rounded-lg border border-violet-100 bg-white/95 p-4 shadow-sm backdrop-blur">
  <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <div class="text-sm font-semibold text-[#24152f]">Filtrer les offres</div>
      <p class="mt-1 text-xs leading-5 text-zinc-500">Affinez par produit, région ou mot-clé pour trouver le bon lot plus vite.</p>
    </div>

    {#if hasFilters}
      <button
        type="button"
        on:click={resetFilters}
        class="inline-flex items-center justify-center rounded-lg border border-violet-100 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-50"
      >
        Réinitialiser
      </button>
    {/if}
  </div>

  <div class="grid gap-3 lg:grid-cols-[1fr_200px_200px_210px]">
    <label class="relative block">
      <span class="sr-only">Rechercher une annonce</span>
      <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      </svg>
      <input
        bind:value={q}
        class="input-soft pl-11"
        type="search"
        placeholder="Rechercher une annonce, une région, un produit..."
      />
    </label>

    <label class="block">
      <span class="sr-only">Type de produit</span>
      <select bind:value={productType} class="input-soft">
        <option value="">Tous les types</option>
        {#each PRODUCT_TYPES as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="sr-only">Région</span>
      <select bind:value={region} class="input-soft">
        <option value="">Toutes les régions</option>
        {#each REGIONS as item}
          <option value={item}>{item}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="sr-only">Disponibilité</span>
      <select bind:value={availability} class="input-soft">
        <option value="">Toutes les annonces</option>
        <option value="AVAILABLE">Disponibles</option>
        <option value="IN_PROGRESS">En cours d'achat</option>
        <option value="PAID">Payées</option>
      </select>
    </label>
  </div>
</div>
