<script lang="ts">
  import DetailRow from './DetailRow.svelte';

  export let title = '';
  export let description = '';
  export let icon = 'info';
  export let variant = 'light';
  export let items: Array<{ label: string; value: string; icon?: string; hint?: string }> = [];

  const iconPaths: Record<string, string> = {
    building: 'M4 20V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V20M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01M16 10h1.5A2.5 2.5 0 0 1 20 12.5V20',
    file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M8 13h8M8 17h6',
    info: 'M12 17v-5M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    pin: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    scale: 'M12 3v18M6 7h12M6 7l-3 6h6L6 7Zm12 0-3 6h6l-3-6ZM9 21h6',
    shield: 'M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z',
    sprout: 'M12 20v-8M12 12C8 12 5 9 5 5c4 0 7 3 7 7Zm0 0c4 0 7-3 7-7-4 0-7 3-7 7Z',
  };

  const variants: Record<string, { card: string; icon: string; title: string; description: string; divider: string }> = {
    dark: {
      card: 'border-white/10 bg-white/10',
      icon: 'bg-white/10 text-violet-100 ring-white/10',
      title: 'text-white',
      description: 'text-white/60',
      divider: 'divide-white/10',
    },
    light: {
      card: 'border-violet-100 bg-white',
      icon: 'bg-[#fbfaf8] text-violet-800 ring-violet-100',
      title: 'text-[#24152f]',
      description: 'text-zinc-500',
      divider: 'divide-violet-100',
    },
    soft: {
      card: 'border-violet-100 bg-[#fbfaf8]',
      icon: 'bg-white text-violet-800 ring-violet-100',
      title: 'text-[#24152f]',
      description: 'text-zinc-500',
      divider: 'divide-violet-100',
    },
  };

  $: styles = variants[variant] ?? variants.light;
  $: path = iconPaths[icon] ?? iconPaths.info;
</script>

<section class={`rounded-lg border p-4 sm:p-5 ${styles.card}`}>
  <div class="flex items-start gap-3">
    <span class={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${styles.icon}`}>
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d={path} />
      </svg>
    </span>
    <div class="min-w-0">
      <h3 class={`text-base font-semibold ${styles.title}`}>{title}</h3>
      {#if description}
        <p class={`mt-1 text-sm leading-6 ${styles.description}`}>{description}</p>
      {/if}
    </div>
  </div>

  <div class={`mt-4 divide-y ${styles.divider}`}>
    {#each items as item}
      <DetailRow
        label={item.label}
        value={item.value}
        icon={item.icon ?? 'info'}
        hint={item.hint ?? ''}
        variant={variant === 'dark' ? 'dark' : 'light'}
      />
    {/each}
  </div>
</section>
