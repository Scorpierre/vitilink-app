<script lang="ts">
  import type { Annonce, CreateAnnonceBody } from '$lib/types';
  import { DEFAULT_CERTIFICATIONS, PRODUCT_TYPES, REGIONS, imageUrl } from '$lib/utils/annonce';
  import FormField from '$lib/components/utils/FormField.svelte';
  import ImageUpload from '$lib/components/utils/ImageUpload.svelte';
  import TagInput from '$lib/components/utils/TagInput.svelte';

  export let submitting = false;
  export let initial: Annonce | null = null;
  export let submitLabel = 'Publier l’annonce';
  export let submittingLabel = 'Publication...';
  export let onSubmit: (body: CreateAnnonceBody) => void | Promise<void>;

  let certifications: string[] = [];
  let images: File[] = [];
  let existingImages: string[] = [];
  let hydratedId = '';
  let form = {
    title: '',
    productType: '',
    description: '',
    price: '',
    volume: '',
    volumeUnit: 'hl',
    vintage: '',
    city: '',
    region: '',
    country: 'France',
    availabilityTiming: '',
    restrictToVerified: false
  };

  $: if (initial?.id && initial.id !== hydratedId) {
    hydratedId = initial.id;
    certifications = [...(initial.certifications ?? [])];
    existingImages = [...(initial.images ?? [])];
    form = {
      title: initial.title ?? '',
      productType: initial.productType ?? '',
      description: initial.description ?? '',
      price: initial.price?.toString() ?? '',
      volume: initial.volume?.toString() ?? '',
      volumeUnit: initial.volumeUnit ?? 'hl',
      vintage: initial.vintage?.toString() ?? '',
      city: initial.city ?? '',
      region: initial.region ?? '',
      country: initial.country ?? 'France',
      availabilityTiming: initial.availabilityTiming ?? '',
      restrictToVerified: initial.restrictToVerified ?? false
    };
  }

  function submit() {
    onSubmit({
      ...form,
      location: [form.city, form.region].filter(Boolean).join(', '),
      certifications,
      existingImages,
      images
    });
  }

  function removeExistingImage(index: number) {
    existingImages = existingImages.filter((_, i) => i !== index);
  }

  function moveExistingImage(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= existingImages.length) return;

    const next = [...existingImages];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    existingImages = next;
  }
</script>

<form class="space-y-6" on:submit|preventDefault={submit}>
  <section class="card overflow-hidden">
    <div class="border-b border-[rgb(var(--border))] bg-white px-6 py-5">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-zinc-950">Composer l’annonce</h2>
          <p class="mt-1 text-sm text-zinc-500">Renseignez le lot, sa disponibilité et les éléments de confiance.</p>
        </div>
        <div class="text-xs font-medium text-zinc-500">
          {images.length + existingImages.length} image{images.length + existingImages.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div class="grid gap-0 lg:grid-cols-[360px_1fr]">
      <aside class="border-b border-[rgb(var(--border))] bg-[rgb(var(--primary-50))]/35 p-5 lg:border-b-0 lg:border-r">
        <div class="lg:sticky lg:top-24">
          <div class="mb-4">
            <h3 class="text-sm font-semibold text-zinc-950">Photos</h3>
            <p class="mt-1 text-xs leading-5 text-zinc-500">Ajoutez, collez, supprimez et ordonnez les visuels de l’annonce.</p>
          </div>

          {#if existingImages.length}
            <div class="mb-5 rounded-[1.75rem] border border-[rgb(var(--border))] bg-white p-3">
              <div class="mb-3">
                <div class="text-sm font-semibold text-zinc-950">Images publiées</div>
                <div class="text-xs text-zinc-500">Conservez uniquement celles à afficher.</div>
              </div>

              <div class="space-y-3">
                {#each existingImages as path, index}
                  <div class="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-zinc-50">
                    <div class="relative aspect-[4/3]">
                      <img src={imageUrl(path)} alt={initial?.title || 'Image annonce'} class="h-full w-full object-cover" />
                      {#if index === 0 && !images.length}
                        <span class="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm">
                          Principale
                        </span>
                      {/if}
                    </div>

                    <div class="grid grid-cols-3 border-t border-[rgb(var(--border))] bg-white">
                      <button
                        type="button"
                        on:click={() => moveExistingImage(index, -1)}
                        disabled={index === 0}
                        class="h-10 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:text-zinc-300"
                        aria-label="Remonter l’image"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        on:click={() => moveExistingImage(index, 1)}
                        disabled={index === existingImages.length - 1}
                        class="h-10 border-x border-[rgb(var(--border))] text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:text-zinc-300"
                        aria-label="Descendre l’image"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        on:click={() => removeExistingImage(index)}
                        class="h-10 text-lg leading-none text-rose-600 transition hover:bg-rose-50"
                        aria-label="Supprimer l’image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <ImageUpload bind:files={images} maxFiles={8 - existingImages.length} />
        </div>
      </aside>

      <div class="space-y-6 p-5 sm:p-6">
        <div>
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary-50))] text-sm font-semibold text-[rgb(var(--primary-800))]">1</div>
            <div>
              <h3 class="text-base font-semibold text-zinc-950">Informations principales</h3>
              <p class="text-sm text-zinc-500">Ce que les acheteurs verront en premier.</p>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <FormField label="Nom de l’annonce" required>
              <input bind:value={form.title} class="input-soft" type="text" placeholder="Raisin Chardonnay disponible" required />
            </FormField>

            <FormField label="Type">
              <select bind:value={form.productType} class="input-soft">
                <option value="">Sélectionner</option>
                {#each PRODUCT_TYPES as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </FormField>

            <FormField label="Volume">
              <div class="grid grid-cols-[1fr_96px] gap-2">
                <input bind:value={form.volume} class="input-soft" type="number" min="0" step="0.01" placeholder="120" />
                <input bind:value={form.volumeUnit} class="input-soft" type="text" placeholder="hl" />
              </div>
            </FormField>

            <FormField label="Prix indicatif">
              <input bind:value={form.price} class="input-soft" type="number" min="0" step="1" placeholder="Prix en euros" />
            </FormField>

            <FormField label="Millésime">
              <input bind:value={form.vintage} class="input-soft" type="number" min="1900" max="2100" placeholder="2025" />
            </FormField>

            <FormField label="Timing">
              <input bind:value={form.availabilityTiming} class="input-soft" type="text" placeholder="Disponible fin septembre, urgent, à convenir..." />
            </FormField>
          </div>

          <div class="mt-4">
            <FormField label="Description">
              <textarea bind:value={form.description} class="input-soft min-h-32 resize-y" placeholder="Précisez la qualité, les contraintes logistiques, les volumes fractionnables..."></textarea>
            </FormField>
          </div>
        </div>

        <div class="border-t border-[rgb(var(--border))] pt-6">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary-50))] text-sm font-semibold text-[rgb(var(--primary-800))]">2</div>
            <div>
              <h3 class="text-base font-semibold text-zinc-950">Localisation et garanties</h3>
              <p class="text-sm text-zinc-500">Les informations qui qualifient le contact.</p>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <FormField label="Ville">
              <input bind:value={form.city} class="input-soft" type="text" placeholder="Beaune" />
            </FormField>

            <FormField label="Région">
              <select bind:value={form.region} class="input-soft">
                <option value="">Sélectionner</option>
                {#each REGIONS as region}
                  <option value={region}>{region}</option>
                {/each}
              </select>
            </FormField>

            <FormField label="Pays">
              <input bind:value={form.country} class="input-soft" type="text" placeholder="France" />
            </FormField>
          </div>

          <div class="mt-5">
            <TagInput
              bind:values={certifications}
              label="Certifications"
              placeholder="Ajouter une certification"
              suggestions={DEFAULT_CERTIFICATIONS}
            />
          </div>

          <label class="mt-5 flex items-start gap-3 rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
            <input bind:checked={form.restrictToVerified} type="checkbox" class="mt-1 h-4 w-4 rounded border-zinc-300 text-[rgb(var(--primary-700))]" />
            <span>
              <span class="block text-sm font-semibold text-zinc-900">Réserver aux entreprises vérifiées</span>
              <span class="mt-1 block text-xs leading-5 text-zinc-500">Seules les entreprises validées pourront initier une prise de contact.</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </section>

  <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <a href="/home/mes-annonces" class="btn-secondary">Annuler</a>
    <button type="submit" disabled={submitting} class="btn-primary">
      {submitting ? submittingLabel : submitLabel}
    </button>
  </div>
</form>
