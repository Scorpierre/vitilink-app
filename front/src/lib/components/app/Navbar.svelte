<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { AuthAPI } from '$lib/api/auth';

  let userMenuOpen = false;
  let mobileOpen = false;

  const navLinks = [
    { label: 'Tableau de bord', href: '/home' },
    { label: 'Vignes', href: '/home/vignes' },
    { label: 'Marché', href: '/home/marche' },
    { label: 'Contacts', href: '/home/contacts' },
  ];

  $: isActive = (href: string) => $page.url.pathname === href;

  async function logout() {
    userMenuOpen = false;
    try { await AuthAPI.logout(); } catch {}
    user.clear();
    goto('/signIn');
  }

  function closeAll() {
    userMenuOpen = false;
    mobileOpen = false;
  }
</script>

{#if userMenuOpen}
  <div class="fixed inset-0 z-30" on:click={() => (userMenuOpen = false)} role="presentation"></div>
{/if}

<header class="fixed top-0 inset-x-0 z-40 h-16 border-b border-white/10" style="background-color: #1b1d2d;">
  <div class="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

    <!-- Logo -->
    <a href="/home" class="flex items-center gap-2.5 shrink-0 group">
      <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-8 h-8 rounded-xl object-cover" />
      <span class="font-semibold text-white text-base hidden sm:block tracking-tight">VitiLink</span>
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-1 flex-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="relative px-3 py-1.5 rounded-lg text-sm font-medium transition group
                 {isActive(link.href)
                   ? 'bg-white/15 text-white'
                   : 'text-white/60 hover:bg-white/10 hover:text-white'}"
        >
          {link.label}
          {#if isActive(link.href)}
            <span class="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></span>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- Right side -->
    <div class="flex items-center gap-1.5">

      <!-- Notifications bell -->
      <button
        class="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition hover:-translate-y-0.5"
        aria-label="Notifications"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white"></span>
      </button>

      <!-- User menu -->
      <div class="relative">
        <button
          on:click={() => (userMenuOpen = !userMenuOpen)}
          class="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition"
        >
          <div class="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 ring-1 ring-brand-200/60">
            <span class="text-xs font-semibold text-brand-700">
              {($user?.username ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <span class="hidden sm:block text-sm font-medium text-white/80 max-w-[100px] truncate">
            {$user?.username ?? 'Utilisateur'}
          </span>
          <svg
            class="w-3.5 h-3.5 text-white/40 transition-transform duration-200 {userMenuOpen ? 'rotate-180' : ''}"
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>

        {#if userMenuOpen}
          <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-brand-200/60 shadow-lg shadow-brand-900/10 overflow-hidden z-50">
            <!-- User info -->
            <div class="px-4 py-3 border-b border-zinc-100">
              <div class="text-sm font-semibold text-zinc-900 truncate">{$user?.username}</div>
              <div class="text-xs text-zinc-500 truncate mt-0.5">{$user?.email}</div>
            </div>
            <!-- Menu items -->
            <div class="p-1.5 space-y-0.5">
              <a href="/home/profil" on:click={closeAll}
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-zinc-700 hover:bg-brand-50 hover:text-brand-700 transition">
                <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
                Mon profil
              </a>
              <a href="/home/parametres" on:click={closeAll}
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-zinc-700 hover:bg-brand-50 hover:text-brand-700 transition">
                <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Paramètres
              </a>
            </div>
            <div class="p-1.5 border-t border-zinc-100">
              <button on:click={logout}
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition"
        on:click={() => (mobileOpen = !mobileOpen)}
        aria-label="Menu"
      >
        {#if mobileOpen}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div class="md:hidden border-t border-white/10" style="background-color: #1b1d2d;">
      <nav class="p-3 space-y-1">
        {#each navLinks as link}
          <a
            href={link.href}
            on:click={closeAll}
            class="block px-3 py-2.5 rounded-xl text-sm font-medium transition
                   {isActive(link.href)
                     ? 'bg-white/15 text-white'
                     : 'text-white/60 hover:bg-white/10 hover:text-white'}"
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>
  {/if}
</header>
