<script lang="ts">
  export let label = '';
  export let placeholder = '';
  export let suggestions: string[] = [];
  export let values: string[] = [];

  let input = '';

  function add(value: string) {
    const next = value.trim();
    if (!next || values.includes(next)) return;
    values = [...values, next];
    input = '';
  }

  function remove(index: number) {
    values = values.filter((_, i) => i !== index);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(input);
    }
  }
</script>

<div class="space-y-3">
  {#if label}
    <div class="text-sm font-medium text-zinc-800">{label}</div>
  {/if}

  <div class="flex flex-wrap gap-2">
    {#each values as value, index}
      <button
        type="button"
        on:click={() => remove(index)}
        class="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--primary-100))] bg-[rgb(var(--primary-50))] px-3 py-1 text-xs font-medium text-[rgb(var(--primary-800))]"
      >
        {value}
        <span class="text-[rgb(var(--primary-500))]">×</span>
      </button>
    {/each}
  </div>

  <input
    bind:value={input}
    on:keydown={onKeydown}
    on:blur={() => add(input)}
    type="text"
    class="input-soft"
    {placeholder}
  />

  {#if suggestions.length}
    <div class="flex flex-wrap gap-2">
      {#each suggestions as suggestion}
        <button
          type="button"
          on:click={() => add(suggestion)}
          class="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-[rgb(var(--primary-200))] hover:bg-[rgb(var(--primary-50))]"
        >
          {suggestion}
        </button>
      {/each}
    </div>
  {/if}
</div>
