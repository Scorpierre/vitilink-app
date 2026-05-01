<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { AuthAPI } from '$lib/api/auth';

  let userMenuOpen = false;
  let mobileOpen = false;

  const navLinks = [
    { label: 'Tableau de bord', href: '/home' },
    { label: 'Annonces', href: '/home/marche' },
    { label: 'Messages', href: '/home/messages' },
    { label: 'Mes annonces', href: '/home/mes-annonces' },
    { label: 'Profil', href: '/home/profil' }
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

<header class="fixed top-0 inset-x-0 z-40">
  <div class="border-b border-[rgba(109,53,168,0.08)] bg-white/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 py-3">

      <a href="/home" class="flex items-center gap-3 shrink-0">
        <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-10 h-10 rounded-2xl object-cover shadow-sm" />
        <div class="hidden sm:block">
          <div class="font-semibold text-[15px] tracking-tight text-zinc-950">VitiLink</div>
          <div class="text-[11px] text-zinc-500 -mt-0.5">Marketplace viticole B2B</div>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-1 rounded-2xl border border-[rgb(var(--border))] bg-white p-1 shadow-sm">
        {#each navLinks as link}
          <a
            href={link.href}
            class={`relative px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive(link.href)
                ? 'bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-800))]'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
            }`}
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <div class="flex items-center gap-2">
        <a
          href="/home/mes-annonces/new"
          class="hidden sm:inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition"
          style="background: linear-gradient(135deg, #6d35a8, #8b5cf6); box-shadow: 0 10px 24px rgba(124,58,237,0.22);"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Déposer une annonce
        </a>

        <button
          class="relative w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-[rgb(var(--primary-50))] hover:text-[rgb(var(--primary-700))] transition"
          aria-label="Notifications"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
          </svg>
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[rgb(var(--primary-600))] ring-2 ring-white"></span>
        </button>

        <div class="relative">
          <button
            on:click={() => (userMenuOpen = !userMenuOpen)}
            class="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl border border-[rgb(var(--border))] bg-white hover:bg-zinc-50 transition shadow-sm"
          >
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-semibold text-sm"
                 style="background: linear-gradient(135deg, #6d35a8, #8b5cf6);">
              {($user?.username ?? 'U').charAt(0).toUpperCase()}
            </div>

            <span class="hidden sm:block text-sm font-medium text-zinc-800 max-w-[120px] truncate">
              {$user?.username ?? 'Utilisateur'}
            </span>

            <svg
              class="w-4 h-4 text-zinc-400 transition-transform duration-200 {userMenuOpen ? 'rotate-180' : ''}"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>

          {#if userMenuOpen}
            <div class="absolute right-0 mt-3 w-64 rounded-3xl border border-[rgb(var(--border))] bg-white shadow-[0_20px_60px_rgba(31,13,54,0.12)] overflow-hidden z-50">
              <div class="p-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--primary-50))]">
                <div class="text-sm font-semibold text-zinc-950 truncate">{$user?.username}</div>
                <div class="text-xs text-zinc-500 truncate mt-0.5">{$user?.email}</div>
              </div>

              <div class="p-2">
                <a href="/home/profil" on:click={closeAll}
                  class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-zinc-700 hover:bg-[rgb(var(--primary-50))] hover:text-[rgb(var(--primary-800))] transition">
                  Mon profil
                </a>

                <a href="/home/parametres" on:click={closeAll}
                  class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-zinc-700 hover:bg-[rgb(var(--primary-50))] hover:text-[rgb(var(--primary-800))] transition">
                  Paramètres
                </a>
              </div>

              <div class="p-2 border-t border-[rgb(var(--border))]">
                <button
                  on:click={logout}
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-rose-600 hover:bg-rose-50 transition"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          {/if}
        </div>

        <button
          class="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition"
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

    {#if mobileOpen}
      <div class="md:hidden border-t border-[rgb(var(--border))] bg-white">
        <nav class="p-3 space-y-1">
          {#each navLinks as link}
            <a
              href={link.href}
              on:click={closeAll}
              class={`block px-4 py-3 rounded-2xl text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-800))]'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              {link.label}
            </a>
          {/each}

          <a
            href="/home/mes-annonces/new"
            on:click={closeAll}
            class="block mt-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white text-center"
            style="background: linear-gradient(135deg, #6d35a8, #8b5cf6);"
          >
            Déposer une annonce
          </a>
        </nav>
      </div>
    {/if}
  </div>
</header>