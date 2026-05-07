<script lang="ts">
  export let files: File[] = [];
  export let maxFiles = 8;

  $: remaining = Math.max(maxFiles - files.length, 0);

  function addFiles(nextFiles: File[]) {
    const images = nextFiles.filter((file) => file.type.startsWith('image/'));
    files = [...files, ...images].slice(0, maxFiles);
  }

  function onChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    addFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  function remove(index: number) {
    files = files.filter((_, i) => i !== index);
  }

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= files.length) return;

    const next = [...files];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    files = next;
  }

  function onPaste(event: ClipboardEvent) {
    const pastedFiles = Array.from(event.clipboardData?.items ?? [])
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item, index) => {
        const file = item.getAsFile();
        if (!file) return null;
        return new File([file], file.name || `image-collee-${Date.now()}-${index}.png`, {
          type: file.type || 'image/png'
        });
      })
      .filter(Boolean) as File[];

    if (!pastedFiles.length) return;
    event.preventDefault();
    addFiles(pastedFiles);
  }
</script>

<svelte:window on:paste={onPaste} />

<div class="space-y-4">
  <label class="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[rgb(var(--border))] bg-white px-4 py-8 text-center transition hover:bg-[rgb(var(--primary-50))]">
    <input class="hidden" type="file" accept="image/png,image/jpeg,image/webp" multiple on:change={onChange} />
    <span class="text-sm font-semibold text-zinc-900">Ajouter ou coller des images</span>
    <span class="mt-1 text-xs text-zinc-500">PNG, JPG ou WebP. Il reste {remaining} emplacement{remaining > 1 ? 's' : ''}.</span>
    <span class="mt-3 rounded-full bg-[rgb(var(--primary-50))] px-3 py-1 text-xs font-medium text-[rgb(var(--primary-800))]">
      Coller avec Cmd/Ctrl + V
    </span>
  </label>

  {#if files.length}
    <div class="rounded-[1.75rem] border border-[rgb(var(--border))] bg-white p-3">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-zinc-950">Images sélectionnées</div>
          <div class="text-xs text-zinc-500">La première image sera utilisée comme visuel principal.</div>
        </div>
        <div class="text-xs font-medium text-zinc-500">{files.length}/{maxFiles}</div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {#each files as file, index}
        <div class="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-zinc-50">
          <div class="relative aspect-[4/3]">
            <img src={URL.createObjectURL(file)} alt={file.name} class="h-full w-full object-cover" />
            {#if index === 0}
              <span class="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm">
                Principale
              </span>
            {/if}
          </div>

          <div class="grid grid-cols-3 border-t border-[rgb(var(--border))] bg-white">
            <button
              type="button"
              on:click={() => move(index, -1)}
              disabled={index === 0}
              class="h-10 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:text-zinc-300"
              aria-label="Déplacer l’image vers la gauche"
            >
              ←
            </button>
            <button
              type="button"
              on:click={() => move(index, 1)}
              disabled={index === files.length - 1}
              class="h-10 border-x border-[rgb(var(--border))] text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:text-zinc-300"
              aria-label="Déplacer l’image vers la droite"
            >
              →
            </button>
          <button
            type="button"
            on:click={() => remove(index)}
              class="h-10 text-lg leading-none text-rose-600 transition hover:bg-rose-50"
            aria-label="Retirer l’image"
          >
            ×
          </button>
          </div>
        </div>
      {/each}
      </div>
    </div>
  {/if}
</div>
