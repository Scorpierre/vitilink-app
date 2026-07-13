<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  export let className = '';

  const prefersReducedMotion =
    browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $: routeKey = $page.url.pathname;
  $: enter = {
    y: prefersReducedMotion ? 0 : 14,
    duration: prefersReducedMotion ? 0 : 260,
    easing: cubicOut,
    opacity: 0,
  };
  $: leave = {
    duration: prefersReducedMotion ? 0 : 90,
  };
</script>

{#key routeKey}
  <div class={`page-transition-surface ${className}`} in:fly={enter} out:fade={leave}>
    <slot />
  </div>
{/key}
