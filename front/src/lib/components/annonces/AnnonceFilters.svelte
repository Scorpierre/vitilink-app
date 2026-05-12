<script lang="ts">
  import { PRODUCT_TYPES, REGIONS } from '$lib/utils/annonce';

  export let q = '';
  export let region = '';
  export let productType = '';
</script>

<div class="card p-4">
  <div class="grid gap-3 md:grid-cols-[1fr_220px_220px]">
    <input bind:value={q} class="input-soft" type="search" placeholder="Rechercher une annonce, une région, un produit..." />

    <select bind:value={productType} class="input-soft">
      <option value="">Tous les types</option>
      {#each PRODUCT_TYPES as type}
        <option value={type}>{type}</option>
      {/each}
    </select>

    <select bind:value={region} class="input-soft">
      <option value="">Toutes les régions</option>
      {#each REGIONS as item}
        <option value={item}>{item}</option>
      {/each}
    </select>
  </div>
</div>
