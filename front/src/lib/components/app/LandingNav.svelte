<script lang="ts">
  let menuOpen = false;

  const links = [
    ['MVP', '/#mvp'],
    ['Contexte', '/#contexte'],
    ['Problème', '/#probleme'],
    ['Solution', '/#solution'],
  ];

  function closeMenu() {
    menuOpen = false;
  }
</script>

<header class="fixed inset-x-0 top-0 z-50 border-b border-white/55 bg-white/85 shadow-sm shadow-black/5 backdrop-blur-xl">
  <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <a href="/" class="flex items-center gap-3" aria-label="Accueil VitiLink">
      <img src="/logo/icon_vitilink.png" alt="" class="h-9 w-9 rounded-lg object-cover" />
      <span class="text-base font-semibold tracking-tight text-[#24152f]">VitiLink</span>
    </a>

    <nav class="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
      {#each links as [label, href]}
        <a class="text-sm font-medium text-zinc-700 transition hover:text-violet-700" {href}>
          {label}
        </a>
      {/each}
    </nav>

    <div class="hidden items-center gap-3 md:flex">
      <a
        href="https://www.linkedin.com/company/vitilinkfrance"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 transition hover:border-violet-200 hover:text-violet-700"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5H4.5V23.5H.5zM8.5 8.5H12.3V10.6H12.35C12.88 9.6 14.2 8.5 16.2 8.5C20.2 8.5 21 11.1 21 14.6V23.5H17V15.6C17 13.7 17 11.2 14.5 11.2C12 11.2 11.6 13.2 11.6 15.5V23.5H7.6V8.5H8.5z"/>
        </svg>
        LinkedIn
      </a>
      <a
        href="/signIn"
        class="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 transition hover:-translate-y-0.5 hover:bg-violet-100"
      >
        Se connecter
      </a>
      <a
        href="/signUp"
        class="inline-flex items-center justify-center rounded-lg bg-[#5b2df2] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-900/20 transition hover:-translate-y-0.5 hover:bg-[#4b22ce]"
      >
        Devenir testeur
      </a>
    </div>

    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-[#24152f] md:hidden"
      aria-label="Ouvrir le menu"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    >
      {#if menuOpen}
        <span class="text-xl leading-none">×</span>
      {:else}
        <span class="text-xl leading-none">☰</span>
      {/if}
    </button>
  </div>

  {#if menuOpen}
    <div class="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
      <nav class="mx-auto flex max-w-6xl flex-col gap-1" aria-label="Navigation mobile">
        {#each links as [label, href]}
          <a
            class="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-violet-50 hover:text-violet-700"
            {href}
            onclick={closeMenu}
          >
            {label}
          </a>
        {/each}
        <div class="mt-3 grid gap-2 border-t border-zinc-200 pt-3">
          <a
            href="https://www.linkedin.com/company/vitilinkfrance"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg border border-zinc-200 px-3 py-2.5 text-center text-sm font-semibold text-zinc-800"
            onclick={closeMenu}
          >
            LinkedIn
          </a>
          <a
            href="/signIn"
            class="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-sm font-semibold text-violet-800"
            onclick={closeMenu}
          >
            Se connecter
          </a>
          <a
            href="/signUp"
            class="rounded-lg bg-[#5b2df2] px-3 py-2.5 text-center text-sm font-semibold text-white"
            onclick={closeMenu}
          >
            Devenir testeur
          </a>
        </div>
      </nav>
    </div>
  {/if}
</header>
