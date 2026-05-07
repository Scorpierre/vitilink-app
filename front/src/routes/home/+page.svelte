<script lang="ts">
  import { user } from '$lib/stores/user';

  const quickStats = [
    { label: 'Annonces actives', value: '12', helper: 'En ligne actuellement' },
    { label: 'Messages reçus', value: '18', helper: 'Sur les 7 derniers jours' },
    { label: 'Contacts qualifiés', value: '24', helper: 'Prospects et partenaires' },
    { label: 'Vues annonces', value: '184', helper: 'Sur les 30 derniers jours' }
  ];

  const shortcuts = [
    { label: 'Déposer une annonce', href: '/home/mes-annonces/new' },
    { label: 'Parcourir les annonces', href: '/home/marche' },
    { label: 'Ouvrir la messagerie', href: '/home/messages' }
  ];
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

  <section class="relative overflow-hidden rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(31,13,54,0.06)]">
    <div class="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-[rgba(167,139,250,0.18)] blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-[rgba(124,58,237,0.10)] blur-3xl"></div>

    <div class="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--primary-50))] px-3 py-1 text-xs font-medium text-[rgb(var(--primary-800))] border border-[rgb(var(--primary-100))]">
          Tableau de bord
        </div>

        <h1 class="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
          Bonjour, {$user?.username ?? 'Utilisateur'}
        </h1>

        <p class="mt-3 max-w-2xl text-sm md:text-base leading-7 text-zinc-600">
          Gérez vos annonces, échangez avec vos contacts professionnels et développez votre activité
          viticole depuis une interface claire, élégante et rapide.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/home/mes-annonces/new" class="btn-primary">
            Déposer une annonce
          </a>
          <a href="/home/marche" class="btn-secondary">
            Explorer le marché
          </a>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        {#each quickStats as stat}
          <div class="rounded-3xl border border-[rgb(var(--border))] bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)] p-5">
            <div class="text-2xl font-semibold text-zinc-950">{stat.value}</div>
            <div class="mt-1 text-sm font-medium text-zinc-700">{stat.label}</div>
            <div class="mt-1 text-xs text-zinc-500">{stat.helper}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="grid lg:grid-cols-3 gap-6 mt-8">
    <div class="lg:col-span-2 card overflow-hidden">
      <div class="px-6 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-950">Activité récente</h2>
          <p class="text-sm text-zinc-500 mt-1">Vos interactions les plus récentes sur la plateforme</p>
        </div>
        <span class="text-xs rounded-full bg-[rgb(var(--primary-50))] px-2.5 py-1 text-[rgb(var(--primary-800))] border border-[rgb(var(--primary-100))]">
          Bientôt disponible
        </span>
      </div>

      <div class="flex flex-col items-center justify-center py-16 text-center px-6">
        <div class="w-16 h-16 rounded-3xl bg-[rgb(var(--primary-50))] flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-[rgb(var(--primary-600))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-zinc-700">Votre activité apparaîtra ici</p>
        <p class="text-sm text-zinc-500 mt-1 max-w-md">
          Dès que vous publierez des annonces ou échangerez avec d'autres professionnels,
          cette zone affichera les derniers événements importants.
        </p>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-[rgb(var(--border))]">
        <h2 class="text-base font-semibold text-zinc-950">Accès rapides</h2>
      </div>

      <div class="p-4 space-y-3">
        {#each shortcuts as item}
          <a
            href={item.href}
            class="block rounded-2xl border border-[rgb(var(--border))] bg-white px-4 py-4 text-sm font-medium text-zinc-700 hover:bg-[rgb(var(--primary-50))] hover:text-[rgb(var(--primary-800))] transition"
          >
            {item.label}
          </a>
        {/each}
      </div>

      <div class="px-6 pb-6 pt-2">
        <div class="rounded-3xl bg-[linear-gradient(135deg,#2d1b3d_0%,#6d35a8_100%)] p-5 text-white">
          <div class="text-sm font-semibold">Mon profil</div>
          <div class="mt-3 flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-xl font-bold">
              {($user?.username ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div class="min-w-0">
              <div class="font-medium truncate">{$user?.username ?? '—'}</div>
              <div class="text-xs text-white/70 truncate">{$user?.email ?? '—'}</div>
            </div>
          </div>

          <a
            href="/home/profil"
            class="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[rgb(var(--primary-800))] transition hover:bg-white/90"
          >
            Voir mon profil
          </a>
        </div>
      </div>
    </div>
  </section>
</div>