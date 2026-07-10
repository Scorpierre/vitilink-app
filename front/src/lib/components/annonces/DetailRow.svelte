<script lang="ts">
  export let label = '';
  export let value = '';
  export let icon = 'info';
  export let hint = '';
  export let variant = 'light';

  const iconPaths: Record<string, string> = {
    bank: 'M3 10h18M5 10V8l7-4 7 4v2M6 10v8m4-8v8m4-8v8m4-8v8M4 18h16',
    building: 'M4 20V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5V20M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01M16 10h1.5A2.5 2.5 0 0 1 20 12.5V20',
    calendar: 'M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
    cart: 'M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h6.8a2 2 0 0 0 1.9-1.4L21 8H7M10 20h.01M17 20h.01',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M8 13h8M8 17h6',
    grape: 'M9 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM11.5 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 6c1.7-2.2 3.8-2.7 6-2',
    hash: 'M5 9h14M5 15h14M9 4 7 20M17 4l-2 16',
    info: 'M12 17v-5M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    leaf: 'M5 19c8 0 14-6 14-14V4h-1C10 4 4 10 4 18v1h1Zm0 0 9-9',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
    map: 'M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Zm0 0V4m6 16V6',
    pin: 'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    scale: 'M12 3v18M6 7h12M6 7l-3 6h6L6 7Zm12 0-3 6h6l-3-6ZM9 21h6',
    shield: 'M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z',
    sprout: 'M12 20v-8M12 12C8 12 5 9 5 5c4 0 7 3 7 7Zm0 0c4 0 7-3 7-7-4 0-7 3-7 7Z',
    user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  };

  const variants: Record<string, { icon: string; label: string; value: string; hint: string }> = {
    dark: {
      icon: 'bg-white/10 text-violet-100 ring-white/10',
      label: 'text-white/45',
      value: 'text-white',
      hint: 'text-white/55',
    },
    light: {
      icon: 'bg-violet-50 text-violet-700 ring-violet-100',
      label: 'text-zinc-400',
      value: 'text-[#24152f]',
      hint: 'text-zinc-500',
    },
  };

  $: path = iconPaths[icon] ?? iconPaths.info;
  $: styles = variants[variant] ?? variants.light;
</script>

<div class="flex min-w-0 gap-3 py-3">
  <span class={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md ring-1 ${styles.icon}`}>
    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d={path} />
    </svg>
  </span>

  <div class="min-w-0 flex-1">
    <div class={`text-[11px] font-semibold uppercase tracking-[0.14em] ${styles.label}`}>{label}</div>
    <div class={`mt-1 break-words text-sm font-semibold leading-5 [overflow-wrap:break-word] ${styles.value}`}>
      {value || '—'}
    </div>
    {#if hint}
      <div class={`mt-1 text-xs leading-5 ${styles.hint}`}>{hint}</div>
    {/if}
  </div>
</div>
