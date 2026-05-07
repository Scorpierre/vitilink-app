<script lang="ts">
  export let title = '';
  export let text = '';
  export let actionHref = '';
  export let actionLabel = '';
</script>

<div class="rounded-[2rem] border border-dashed border-[rgb(var(--border))] bg-white px-6 py-14 text-center">
  <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-700))]">
    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  </div>
  <h2 class="text-base font-semibold text-zinc-950">{title}</h2>
  <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{text}</p>
  {#if actionHref && actionLabel}
    <a href={actionHref} class="btn-primary mt-5">{actionLabel}</a>
  {/if}
</div>
