<script lang="ts">
  export let eyebrow = '';
  export let title = '';
  export let subtitle = '';
  export let actionHref = '';
  export let actionLabel = '';
</script>

<div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
  <div>
    {#if eyebrow}
      <div class="badge-soft mb-3">{eyebrow}</div>
    {/if}
    <h1 class="text-2xl md:text-3xl font-semibold text-zinc-950">{title}</h1>
    {#if subtitle}
      <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{subtitle}</p>
    {/if}
  </div>

  {#if actionHref && actionLabel}
    <a href={actionHref} class="btn-primary shrink-0">{actionLabel}</a>
  {/if}
</div>
