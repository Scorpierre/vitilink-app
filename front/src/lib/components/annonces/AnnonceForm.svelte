<script lang="ts">
  import type {
    Annonce,
    CreateAnnonceBody,
    DocumentItem,
    DocumentVisibility,
    ExistingAnnonceDocument
  } from '$lib/types';
  import { DEFAULT_CERTIFICATIONS, PRODUCT_TYPES, REGIONS, imageUrl, normalizeProductType } from '$lib/utils/annonce';
  import FormField from '$lib/components/utils/FormField.svelte';
  import ImageUpload from '$lib/components/utils/ImageUpload.svelte';
  import TagInput from '$lib/components/utils/TagInput.svelte';

  export let submitting = false;
  export let initial: Annonce | null = null;
  export let submitLabel = 'Publier l’annonce';
  export let submittingLabel = 'Publication...';
  export let minImages = 1;
  export let onSubmit: (body: CreateAnnonceBody) => void | Promise<void>;

  const stepItems = [
    {
      id: 'lot',
      title: 'Lot',
      detail: 'Titre, produit et volume',
      fields: ['title', 'productType', 'volume', 'volumeUnit', 'vintage']
    },
    {
      id: 'commercial',
      title: 'Conditions',
      detail: 'Prix, timing et description',
      fields: ['price', 'availabilityTiming', 'description']
    },
    {
      id: 'photos',
      title: 'Photos',
      detail: 'Au moins une photo du lot',
      fields: ['images']
    },
    {
      id: 'documents',
      title: 'Documents',
      detail: 'Publics ou réservés',
      fields: ['documents']
    },
    {
      id: 'location',
      title: 'Localisation',
      detail: 'Ville, région et pays',
      fields: ['city', 'region', 'country']
    },
    {
      id: 'trust',
      title: 'Confiance',
      detail: 'Garanties et accès',
      fields: ['certifications', 'restrictToVerified']
    }
  ];

  const checklist = [
    'Un titre lisible en quelques secondes',
    'Un volume et une unité clairement indiqués',
    'Au moins une photo réelle du lot',
    'La visibilité des documents vérifiée',
    'Un timing qui évite les échanges inutiles',
    'Une localisation utile pour anticiper la logistique'
  ];

  type DocumentDraft = {
    id: string;
    file: File;
    label: string;
    visibility: DocumentVisibility;
  };

  type ExistingDocumentDraft = ExistingAnnonceDocument & {
    originalName?: string;
    url?: string;
    mimeType?: string;
    sizeBytes?: number;
  };

  let certifications: string[] = [];
  let images: File[] = [];
  let existingImages: string[] = [];
  let saleDocuments: DocumentDraft[] = [];
  let existingSaleDocuments: ExistingDocumentDraft[] = [];
  let imageValidationError = '';
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
    existingSaleDocuments = (initial.documents ?? []).map(toExistingDocumentDraft);
    form = {
      title: initial.title ?? '',
      productType: normalizeProductType(initial.productType),
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

  $: totalImages = images.length + existingImages.length;
  $: totalDocuments = saleDocuments.length + existingSaleDocuments.length;
  $: if (totalImages >= minImages) imageValidationError = '';
  $: fieldItems = [
    { id: 'title', complete: Boolean(form.title.trim()) },
    { id: 'productType', complete: Boolean(form.productType) },
    { id: 'volume', complete: Boolean(form.volume) },
    { id: 'volumeUnit', complete: Boolean(form.volumeUnit.trim()) },
    { id: 'vintage', complete: Boolean(form.vintage) },
    { id: 'price', complete: Boolean(form.price) },
    { id: 'availabilityTiming', complete: Boolean(form.availabilityTiming.trim()) },
    { id: 'description', complete: Boolean(form.description.trim()) },
    { id: 'images', complete: totalImages >= minImages },
    { id: 'documents', complete: totalDocuments > 0 },
    { id: 'city', complete: Boolean(form.city.trim()) },
    { id: 'region', complete: Boolean(form.region) },
    { id: 'country', complete: Boolean(form.country.trim()) },
    { id: 'certifications', complete: certifications.length > 0 },
    { id: 'restrictToVerified', complete: form.restrictToVerified }
  ];
  $: completedFields = fieldItems.filter((field) => field.complete).length;
  $: completionPercent = Math.round((completedFields / fieldItems.length) * 100);
  $: previewTitle = form.title.trim() || 'Votre lot viticole';
  $: previewMeta = [
    form.productType || 'Type à préciser',
    form.volume ? `${form.volume} ${form.volumeUnit || ''}`.trim() : 'Volume à préciser',
    form.region || form.city || 'Localisation à préciser'
  ].filter(Boolean).join(' - ');
  $: pricePreview = form.price ? `${form.price} EUR` : 'Prix indicatif à compléter';

  function submit() {
    if (totalImages < minImages) {
      imageValidationError = 'Ajoutez au moins une photo pour publier une annonce.';
      document.getElementById('annonce-photos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    onSubmit({
      ...form,
      location: [form.city, form.region].filter(Boolean).join(', '),
      certifications,
      existingImages,
      images,
      existingDocuments: existingSaleDocuments.map(({ id, label, visibility }) => ({
        id,
        label,
        visibility
      })),
      documents: saleDocuments.map(({ file, label, visibility }) => ({
        file,
        label,
        visibility
      }))
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

  function isStepComplete(id: string) {
    const step = stepItems.find((item) => item.id === id);
    if (!step) return false;
    return getStepCompletedCount(step) === step.fields.length;
  }

  function getStepCompletedCount(step: (typeof stepItems)[number]) {
    return step.fields.filter((id) => fieldItems.some((field) => field.id === id && field.complete)).length;
  }

  function addSaleDocuments(fileList: FileList | null) {
    if (!fileList?.length) return;

    const remainingSlots = Math.max(0, 8 - totalDocuments);
    const nextFiles = Array.from(fileList).slice(0, remainingSlots);
    saleDocuments = [
      ...saleDocuments,
      ...nextFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        label: file.name.replace(/\.[^.]+$/, ''),
        visibility: 'BUYER_ONLY' as DocumentVisibility
      }))
    ];
  }

  function handleDocumentInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    addSaleDocuments(input.files);
    input.value = '';
  }

  function removeSaleDocument(id: string) {
    saleDocuments = saleDocuments.filter((documentItem) => documentItem.id !== id);
  }

  function removeExistingSaleDocument(id: string) {
    existingSaleDocuments = existingSaleDocuments.filter((documentItem) => documentItem.id !== id);
  }

  function toExistingDocumentDraft(documentItem: DocumentItem): ExistingDocumentDraft {
    return {
      id: documentItem.id,
      label: documentItem.label ?? documentItem.originalName ?? '',
      visibility: documentItem.visibility ?? 'PUBLIC',
      originalName: documentItem.originalName,
      url: documentItem.url,
      mimeType: documentItem.mimeType,
      sizeBytes: documentItem.sizeBytes
    };
  }

  function documentVisibilityLabel(visibility: DocumentVisibility) {
    return visibility === 'BUYER_ONLY' ? 'Réservé à l’acheteur' : 'Visible par tous';
  }

  function formatFileSize(size?: number) {
    if (!size) return '';
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }
</script>

<form class="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]" on:submit|preventDefault={submit}>
  <aside class="min-h-0 space-y-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
    <section class="overflow-hidden rounded-[1.5rem] bg-[#181121] text-white shadow-[0_24px_70px_rgba(24,17,33,0.22)]">
      <div class="relative isolate px-5 py-5">
        <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(139,92,246,0.45),transparent_36%),radial-gradient(circle_at_96%_18%,rgba(34,197,94,0.20),transparent_30%)]"></div>

        <div class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          Fil conducteur
        </div>

        <div class="mt-4">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Progression</p>
              <p class="mt-1 text-2xl font-semibold">{completionPercent}%</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-right">
              <p class="text-xs text-white/55">Champs</p>
              <p class="text-sm font-semibold">{completedFields}/{fieldItems.length}</p>
            </div>
          </div>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300 transition-all duration-500" style={`width: ${completionPercent}%`}></div>
          </div>
        </div>

        <div class="mt-5 space-y-3">
          {#each stepItems as step, index}
            <div class="relative flex gap-3">
              {#if index < stepItems.length - 1}
                <div class="absolute left-3.5 top-8 h-[calc(100%-0.125rem)] w-px bg-white/15"></div>
              {/if}
              <div
                class={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                  isStepComplete(step.id)
                    ? 'bg-emerald-300 text-[#181121]'
                    : 'border border-white/15 bg-white/10 text-white/70'
                }`}
              >
                {isStepComplete(step.id) ? '✓' : index + 1}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white">{step.title}</p>
                <p class="mt-0.5 text-xs leading-5 text-white/55">{step.detail}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="border-t border-white/10 bg-white/[0.06] px-5 py-4">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Aperçu</p>
        <h3 class="mt-2 text-base font-semibold leading-tight">{previewTitle}</h3>
        <p class="mt-1 text-xs leading-5 text-white/60">{previewMeta}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">{pricePreview}</span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {totalImages} image{totalImages > 1 ? 's' : ''} / min. {minImages}
          </span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {totalDocuments} document{totalDocuments > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </section>
  </aside>

  <div class="space-y-5">
    <section id="annonce-lot" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--primary-50))] text-base font-bold text-[rgb(var(--primary-800))]">
          1
        </div>
        <div>
          <h2 class="text-xl font-semibold text-zinc-950">Identifier le lot</h2>
          <p class="mt-1 text-sm leading-6 text-zinc-500">Les informations qui permettent de comprendre l’offre immédiatement.</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <FormField label="Nom de l’annonce" helper="Exemple : Raisin Chardonnay disponible fin septembre." required>
          <input id="annonce-title" bind:value={form.title} class="input-soft" type="text" placeholder="Raisin Chardonnay disponible" required />
        </FormField>

        <FormField label="Type de produit" helper="Choisissez uniquement : raisin, moût de raisin ou jus de raisin.">
          <select id="annonce-product-type" bind:value={form.productType} class="input-soft">
            <option value="">Sélectionner</option>
            {#each PRODUCT_TYPES as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </FormField>

        <FormField label="Volume" helper="Indiquez le volume disponible et l’unité utile pour comparer.">
          <div class="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
            <input id="annonce-volume" bind:value={form.volume} class="input-soft" type="number" min="0" step="0.01" placeholder="120" />
            <input id="annonce-volume-unit" bind:value={form.volumeUnit} class="input-soft" type="text" placeholder="hl" aria-label="Unité du volume" />
          </div>
        </FormField>

        <FormField label="Millésime" helper="Utile pour situer la récolte ou le lot.">
          <input id="annonce-vintage" bind:value={form.vintage} class="input-soft" type="number" min="1900" max="2100" placeholder="2026" />
        </FormField>
      </div>
    </section>

    <section id="annonce-conditions" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-base font-bold text-amber-700">
          2
        </div>
        <div>
          <h2 class="text-xl font-semibold text-zinc-950">Préciser les conditions</h2>
          <p class="mt-1 text-sm leading-6 text-zinc-500">Le prix, la disponibilité et les détails pratiques évitent les premiers allers-retours.</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <FormField label="Prix indicatif" helper="Le prix reste indicatif, mais aide les acheteurs à qualifier le contact.">
          <input id="annonce-price" bind:value={form.price} class="input-soft" type="number" min="0" step="1" placeholder="Prix en euros" />
        </FormField>

        <FormField label="Disponibilité / timing" helper="Ex : disponible fin septembre, urgent, à convenir.">
          <input id="annonce-availability" bind:value={form.availabilityTiming} class="input-soft" type="text" placeholder="Disponible fin septembre" />
        </FormField>
      </div>

      <div class="mt-4">
        <FormField label="Description détaillée" helper="Mentionnez la qualité, la logistique, les volumes fractionnables ou les contraintes de retrait.">
          <textarea
            id="annonce-description"
            bind:value={form.description}
            class="input-soft min-h-36 resize-y"
            placeholder="Précisez la qualité du lot, les contraintes logistiques, les volumes fractionnables..."
          ></textarea>
        </FormField>
      </div>
    </section>

    <section id="annonce-photos" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-base font-bold text-violet-700">
            3
          </div>
          <div>
            <h2 class="text-xl font-semibold text-zinc-950">Ajouter les photos</h2>
            <p class="mt-1 text-sm leading-6 text-zinc-500">Une annonce doit contenir au moins une photo pour être publiée.</p>
          </div>
        </div>
        <div class={`rounded-full px-3 py-1 text-xs font-semibold ${
          totalImages >= minImages
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
        }`}>
          {totalImages}/8
        </div>
      </div>

      {#if imageValidationError}
        <div class="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {imageValidationError}
        </div>
      {/if}

      {#if existingImages.length}
        <div class="mb-5 rounded-[1.5rem] border border-[rgb(var(--border))] bg-zinc-50 p-3">
          <div class="mb-3">
            <div class="text-sm font-semibold text-zinc-950">Images publiées</div>
            <div class="text-xs text-zinc-500">Conservez uniquement celles à afficher.</div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {#each existingImages as path, index}
              <div class="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white">
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
    </section>

    <section id="annonce-documents" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-base font-bold text-fuchsia-700">
            4
          </div>
          <div>
            <h2 class="text-xl font-semibold text-zinc-950">Joindre des documents</h2>
            <p class="mt-1 text-sm leading-6 text-zinc-500">
              Ajoutez analyses, contrats ou pièces utiles, puis choisissez leur visibilité.
            </p>
          </div>
        </div>
        <div class="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 ring-1 ring-fuchsia-100">
          {totalDocuments}/8
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <div class="text-sm font-semibold text-[#24152f]">Visible par tous</div>
          <p class="mt-1 text-xs leading-5 text-zinc-600">La pièce apparaît sur l’annonce pour aider à qualifier l’offre avant contact.</p>
        </div>
        <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <div class="text-sm font-semibold text-amber-950">Réservé à l’acheteur</div>
          <p class="mt-1 text-xs leading-5 text-amber-900/70">La pièce est envoyée uniquement au vendeur et à l’acheteur du lot payé.</p>
        </div>
      </div>

      <label class="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-violet-200 bg-[#fbfaf8] px-4 py-7 text-center transition hover:border-violet-400 hover:bg-violet-50/60">
        <input
          type="file"
          class="sr-only"
          multiple
          accept="application/pdf,image/png,image/jpeg,image/webp"
          disabled={totalDocuments >= 8}
          on:change={handleDocumentInput}
        />
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-violet-800 ring-1 ring-violet-100">+</span>
        <span class="mt-3 text-sm font-semibold text-[#24152f]">Ajouter des documents</span>
        <span class="mt-1 text-xs leading-5 text-zinc-500">PDF, PNG, JPG, JPEG ou WEBP, 10 Mo maximum par fichier.</span>
      </label>

      {#if existingSaleDocuments.length || saleDocuments.length}
        <div class="mt-5 space-y-3">
          {#each existingSaleDocuments as documentItem (documentItem.id)}
            <article class="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Document existant</div>
                  <div class="mt-1 truncate text-sm font-semibold text-[#24152f]">{documentItem.originalName || documentItem.label || 'Document'}</div>
                  {#if documentItem.sizeBytes}
                    <div class="mt-1 text-xs text-zinc-500">{formatFileSize(documentItem.sizeBytes)}</div>
                  {/if}
                </div>

                <label class="min-w-0 flex-1">
                  <span class="text-xs font-semibold text-zinc-500">Libellé</span>
                  <input bind:value={documentItem.label} class="input-soft mt-1" type="text" placeholder="Analyse du lot" />
                </label>

                <label class="min-w-0 flex-1">
                  <span class="text-xs font-semibold text-zinc-500">Visibilité</span>
                  <select bind:value={documentItem.visibility} class="input-soft mt-1">
                    <option value="PUBLIC">{documentVisibilityLabel('PUBLIC')}</option>
                    <option value="BUYER_ONLY">{documentVisibilityLabel('BUYER_ONLY')}</option>
                  </select>
                </label>

                <div class="flex gap-2">
                  {#if documentItem.url}
                    <a href={imageUrl(documentItem.url)} target="_blank" rel="noopener noreferrer" class="btn-secondary h-11 px-4">Voir</a>
                  {/if}
                  <button type="button" class="h-11 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50" on:click={() => removeExistingSaleDocument(documentItem.id)}>
                    Retirer
                  </button>
                </div>
              </div>
            </article>
          {/each}

          {#each saleDocuments as documentItem (documentItem.id)}
            <article class="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Nouveau document</div>
                  <div class="mt-1 truncate text-sm font-semibold text-[#24152f]">{documentItem.file.name}</div>
                  <div class="mt-1 text-xs text-zinc-500">{formatFileSize(documentItem.file.size)}</div>
                </div>

                <label class="min-w-0 flex-1">
                  <span class="text-xs font-semibold text-zinc-500">Libellé</span>
                  <input bind:value={documentItem.label} class="input-soft mt-1" type="text" placeholder="Analyse du lot" />
                </label>

                <label class="min-w-0 flex-1">
                  <span class="text-xs font-semibold text-zinc-500">Visibilité</span>
                  <select bind:value={documentItem.visibility} class="input-soft mt-1">
                    <option value="PUBLIC">{documentVisibilityLabel('PUBLIC')}</option>
                    <option value="BUYER_ONLY">{documentVisibilityLabel('BUYER_ONLY')}</option>
                  </select>
                </label>

                <button type="button" class="h-11 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50" on:click={() => removeSaleDocument(documentItem.id)}>
                  Retirer
                </button>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="mt-5 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-500">
          Les documents sont optionnels, mais utiles pour partager une analyse ou une pièce contractuelle au bon moment.
        </div>
      {/if}
    </section>

    <section id="annonce-localisation" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-base font-bold text-emerald-700">
          5
        </div>
        <div>
          <h2 class="text-xl font-semibold text-zinc-950">Situer l’offre</h2>
          <p class="mt-1 text-sm leading-6 text-zinc-500">La localisation aide à estimer la logistique avant même la prise de contact.</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <FormField label="Ville">
          <input id="annonce-city" bind:value={form.city} class="input-soft" type="text" placeholder="Beaune" />
        </FormField>

        <FormField label="Région">
          <select id="annonce-region" bind:value={form.region} class="input-soft">
            <option value="">Sélectionner</option>
            {#each REGIONS as region}
              <option value={region}>{region}</option>
            {/each}
          </select>
        </FormField>

        <FormField label="Pays">
          <input id="annonce-country" bind:value={form.country} class="input-soft" type="text" placeholder="France" />
        </FormField>
      </div>
    </section>

    <section id="annonce-confiance" class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
      <div class="mb-6 flex items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-base font-bold text-rose-700">
          6
        </div>
        <div>
          <h2 class="text-xl font-semibold text-zinc-950">Ajouter les éléments de confiance</h2>
          <p class="mt-1 text-sm leading-6 text-zinc-500">Certifications et restriction aux entreprises vérifiées permettent de cadrer les échanges.</p>
        </div>
      </div>

      <TagInput
        bind:values={certifications}
        label="Certifications"
        placeholder="Ajouter une certification"
        suggestions={DEFAULT_CERTIFICATIONS}
      />

      <label class="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[rgb(var(--border))] bg-[rgb(var(--primary-50))]/50 p-4 transition hover:border-[rgb(var(--primary-200))]">
        <input bind:checked={form.restrictToVerified} type="checkbox" class="mt-1 h-4 w-4 rounded border-zinc-300 text-[rgb(var(--primary-700))]" />
        <span>
          <span class="block text-sm font-semibold text-zinc-900">Réserver aux entreprises vérifiées</span>
          <span class="mt-1 block text-xs leading-5 text-zinc-500">Seules les entreprises validées pourront initier une prise de contact.</span>
        </span>
      </label>
    </section>

    <section class="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-emerald-950">Avant publication</h2>
          <p class="mt-1 text-sm leading-6 text-emerald-900/70">Dernier contrôle avant de rendre l’annonce visible sur la marketplace.</p>
        </div>
        <div class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          {completionPercent}% complété
        </div>
      </div>
      <div class="mt-5 grid gap-3 md:grid-cols-2">
        {#each checklist as item}
          <div class="flex gap-3 rounded-2xl bg-white/70 p-3 text-sm leading-6 text-emerald-900 ring-1 ring-emerald-100">
            <span class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
            <span>{item}</span>
          </div>
        {/each}
      </div>
    </section>

    <div class="flex flex-col-reverse gap-3 rounded-[2rem] border border-[rgb(var(--border))] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm leading-6 text-zinc-500">
        L’annonce sera publiée directement dans la marketplace après envoi.
      </p>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <a href="/dashboard/mes-annonces" class="btn-secondary">Annuler</a>
        <button type="submit" disabled={submitting} class="btn-primary disabled:opacity-60">
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  </div>
</form>
