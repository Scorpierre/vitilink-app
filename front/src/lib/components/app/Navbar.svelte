<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { AuthAPI } from '$lib/api/auth';

  let userMenuOpen = false;
  let mobileOpen = false;

  const navLinks = [
    {
      label: 'Tableau',
      href: '/dashboard',
      icon: 'dashboard',
      helper: 'Vue globale',
    },
    {
      label: 'Annonces',
      href: '/dashboard/marche',
      icon: 'market',
      helper: 'Marketplace',
    },
    {
      label: 'Messages',
      href: '/dashboard/conversations',
      icon: 'messages',
      helper: 'Echanges',
    },
    {
      label: 'Mes annonces',
      href: '/dashboard/mes-annonces',
      icon: 'list',
      helper: 'Gestion',
    },
    {
      label: 'Commandes',
      href: '/dashboard/commandes',
      icon: 'orders',
      helper: 'Suivi',
    },
  ];

  $: currentPath = $page.url.pathname;
  $: isActive = (href: string) =>
    href === '/dashboard' ? currentPath === href : currentPath.startsWith(href);
  $: userDisplayName =
    [$user?.firstName, $user?.lastName].filter(Boolean).join(' ') ||
    $user?.username ||
    'Chargement...';
  $: userInitial =
    ($user?.firstName?.[0] ?? $user?.username?.[0] ?? 'U').toUpperCase();

  async function logout() {
    userMenuOpen = false;
    mobileOpen = false;
    try {
      await AuthAPI.logout();
    } catch {}
    user.clear();
    goto('/signIn');
  }

  function closeAll() {
    userMenuOpen = false;
    mobileOpen = false;
  }
</script>

{#if userMenuOpen || mobileOpen}
  <button
    class="fixed inset-0 z-30 cursor-default bg-transparent"
    aria-label="Fermer les menus"
    onclick={closeAll}
  ></button>
{/if}

<header class="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
  <div class="mx-auto max-w-7xl rounded-lg border border-white/70 bg-white/88 shadow-[0_18px_55px_rgba(40,18,68,0.12)] backdrop-blur-2xl">
    <div class="flex h-16 items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
      <a
        href="/dashboard"
        class="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg px-1 py-1 transition hover:opacity-90"
        aria-label="Accueil dashboard VitiLink"
      >
        <img src="/logo/icon_vitilink.png" alt="" class="h-10 w-10 rounded-lg object-cover shadow-sm" />
        <div class="hidden min-w-0 sm:block">
          <div class="truncate text-sm font-semibold tracking-tight text-[#24152f]">VitiLink</div>
          <div class="truncate text-[11px] font-medium text-violet-700/70">Espace professionnel</div>
        </div>
      </a>

      <nav
        class="hidden items-center gap-1 rounded-lg border border-violet-100 bg-[#fbfaf8]/85 p-1 shadow-inner shadow-violet-950/[0.03] lg:flex"
        aria-label="Navigation principale"
      >
        {#each navLinks as link}
          <a
            href={link.href}
            aria-current={isActive(link.href) ? 'page' : undefined}
            class={`group relative inline-flex h-10 min-w-max items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition ${
              isActive(link.href)
                ? 'bg-white text-violet-800 shadow-sm ring-1 ring-violet-100'
                : 'text-zinc-600 hover:bg-white/80 hover:text-[#24152f]'
            }`}
          >
            <span
              class={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition ${
                isActive(link.href)
                  ? 'bg-violet-100 text-violet-800'
                  : 'bg-white text-zinc-500 group-hover:bg-violet-50 group-hover:text-violet-700'
              }`}
            >
              {#if link.icon === 'dashboard'}
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" />
                </svg>
              {:else if link.icon === 'market'}
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 10h16l-1.3-4.5A2 2 0 0 0 16.78 4H7.22A2 2 0 0 0 5.3 5.5L4 10Zm1 0v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8M9 14h6" />
                </svg>
              {:else if link.icon === 'messages'}
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H12l-4.5 4v-4A3.5 3.5 0 0 1 4 11.5v-5Z" />
                </svg>
              {:else if link.icon === 'list'}
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
                </svg>
              {:else}
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10v13H7V7Zm2-3h6l1 3H8l1-3Zm1 8h4m-4 4h6" />
                </svg>
              {/if}
            </span>
            <span class="whitespace-nowrap">{link.label}</span>
          </a>
        {/each}
      </nav>

      <div class="flex items-center gap-2">
        <a
          href="/dashboard/mes-annonces/nouveau"
          class="hidden items-center gap-2 rounded-lg bg-[#5b2df2] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,45,242,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4b22ce] md:inline-flex"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
          </svg>
          Déposer
        </a>

        <div class="relative">
          <button
            type="button"
            onclick={() => {
              userMenuOpen = !userMenuOpen;
              mobileOpen = false;
            }}
            class="flex h-10 items-center gap-2 rounded-lg border border-violet-100 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200"
            aria-label="Ouvrir le menu utilisateur"
            aria-expanded={userMenuOpen}
          >
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#5b2df2] to-[#8b5cf6] text-sm font-bold text-white">
              {userInitial}
            </span>
            <span class="hidden max-w-[120px] truncate text-sm font-semibold text-zinc-800 sm:block">
              {userDisplayName}
            </span>
            <svg
              class={`h-4 w-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z" clip-rule="evenodd" />
            </svg>
          </button>

          {#if userMenuOpen}
            <div class="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-lg border border-violet-100 bg-white shadow-[0_24px_70px_rgba(31,13,54,0.16)]">
              <div class="relative overflow-hidden bg-[#24152f] p-4 text-white">
                <div class="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-500/40 blur-2xl"></div>
                <div class="relative flex items-center gap-3">
                  <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/14 text-base font-bold">
                    {userInitial}
                  </div>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold">{userDisplayName}</div>
                    <div class="mt-0.5 truncate text-xs text-white/65">{$user?.email ?? 'Compte testeur'}</div>
                  </div>
                </div>
              </div>

              <div class="grid gap-1 p-2">
                <a href="/dashboard/profil" onclick={closeAll} class="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-violet-50 hover:text-violet-800">
                  Mon profil
                </a>
                <a href="/dashboard/commandes" onclick={closeAll} class="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-violet-50 hover:text-violet-800">
                  Mes commandes
                </a>
                <a href="/dashboard" onclick={closeAll} class="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-violet-50 hover:text-violet-800">
                  Retour tableau de bord
                </a>
              </div>

              <div class="border-t border-violet-100 p-2">
                <button
                  type="button"
                  onclick={logout}
                  class="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          {/if}
        </div>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-lg border border-violet-100 bg-white text-zinc-700 shadow-sm transition hover:text-violet-800 lg:hidden"
          onclick={() => {
            mobileOpen = !mobileOpen;
            userMenuOpen = false;
          }}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
        >
          {#if mobileOpen}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>

    {#if mobileOpen}
      <div class="border-t border-violet-100 px-3 py-3 lg:hidden">
        <nav class="grid gap-2" aria-label="Navigation mobile">
          {#each navLinks as link}
            <a
              href={link.href}
              onclick={closeAll}
              aria-current={isActive(link.href) ? 'page' : undefined}
              class={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive(link.href)
                  ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-100'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>{link.label}</span>
              <span class="text-xs font-medium text-zinc-400">{link.helper}</span>
            </a>
          {/each}
          <a
            href="/dashboard/mes-annonces/nouveau"
            onclick={closeAll}
            class="mt-1 rounded-lg bg-[#5b2df2] px-3 py-3 text-center text-sm font-semibold text-white shadow-sm"
          >
            Déposer une annonce
          </a>
        </nav>
      </div>
    {/if}
  </div>
</header>
