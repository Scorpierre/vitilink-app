<script lang="ts">
  import { onMount } from 'svelte';

  let scrolled = false;
  let menuOpen = false;

  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  });

  function closeMenu() { menuOpen = false; }
</script>

<header
  class="fixed top-0 inset-x-0 z-40 transition-all duration-300 {scrolled || menuOpen
    ? 'border-b border-white/10 backdrop-blur-md bg-[#1b1d2d]/95'
    : 'bg-transparent'}"
>
  <div class="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

    <a href="/" class="flex items-center gap-2.5">
      <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-8 h-8 rounded-xl object-cover" />
      <span class="font-semibold text-white text-base tracking-tight">VitiLink</span>
    </a>

    <!-- Desktop nav -->
    <nav class="hidden md:flex items-center gap-6">
      <a href="#mvp"      class="text-sm text-white/55 hover:text-white transition">MVP</a>
      <a href="#contexte" class="text-sm text-white/55 hover:text-white transition">Contexte</a>
      <a href="#probleme" class="text-sm text-white/55 hover:text-white transition">Problème</a>
      <a href="#solution" class="text-sm text-white/55 hover:text-white transition">Solution</a>
    </nav>

    <!-- Desktop CTAs -->
    <div class="hidden md:flex items-center gap-2.5">
      <a href="/signIn" class="text-sm font-medium text-white/55 hover:text-white transition px-3 py-2">
        Se connecter
      </a>
      <a href="/signUp" class="text-sm font-semibold px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-500 hover:-translate-y-0.5 transition shadow-sm shadow-brand-900/30">
        Devenir testeur
      </a>
    </div>

    <!-- Mobile hamburger -->
    <button
      class="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition"
      on:click={() => (menuOpen = !menuOpen)}
      aria-label="Menu"
    >
      <span class="block h-0.5 w-5 bg-white transition-all duration-300 {menuOpen ? 'translate-y-2 rotate-45' : ''}"></span>
      <span class="block h-0.5 w-5 bg-white transition-all duration-300 {menuOpen ? 'opacity-0' : ''}"></span>
      <span class="block h-0.5 w-5 bg-white transition-all duration-300 {menuOpen ? '-translate-y-2 -rotate-45' : ''}"></span>
    </button>
  </div>

  <!-- Mobile menu -->
  {#if menuOpen}
    <div class="md:hidden border-t border-white/10 px-4 py-4 space-y-1">
      {#each [['MVP', '#mvp'], ['Contexte', '#contexte'], ['Problème', '#probleme'], ['Solution', '#solution']] as [label, href]}
        <a {href} on:click={closeMenu} class="block px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition">
          {label}
        </a>
      {/each}
      <div class="pt-3 border-t border-white/10 mt-3 flex flex-col gap-2">
        <a href="/signIn" on:click={closeMenu} class="block text-center px-4 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition">
          Se connecter
        </a>
        <a href="/signUp" on:click={closeMenu} class="block text-center px-4 py-2.5 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-500 transition">
          Devenir testeur
        </a>
      </div>
    </div>
  {/if}
</header>
