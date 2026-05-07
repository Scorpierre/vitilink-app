<script lang="ts">
  export let type: 'error' | 'success' | 'info' = 'info';
  export let message = '';

  $: classes =
    type === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-violet-200 bg-violet-50 text-violet-800';
</script>

{#if message}
  <div class={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
    {message}
  </div>
{/if}
