<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toast } from '$lib/stores/toast';
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 items-end pointer-events-none">
  {#each $toast as t (t.id)}
    <div
      class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium max-w-sm
        {t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70' : ''}
        {t.type === 'error'   ? 'bg-rose-50 text-rose-800 border border-rose-200/70' : ''}
        {t.type === 'info'    ? 'bg-brand-50 text-brand-800 border border-brand-200/70' : ''}"
      in:fly={{ y: 12, duration: 200 }}
      out:fly={{ y: 12, duration: 150 }}
    >
      <!-- Icon -->
      {#if t.type === 'success'}
        <svg class="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      {:else if t.type === 'error'}
        <svg class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
        </svg>
      {:else}
        <svg class="w-4 h-4 shrink-0 mt-0.5 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      {/if}

      <span class="flex-1">{t.message}</span>

      <button
        class="shrink-0 opacity-50 hover:opacity-100 transition"
        on:click={() => toast.remove(t.id)}
        aria-label="Fermer"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  {/each}
</div>
