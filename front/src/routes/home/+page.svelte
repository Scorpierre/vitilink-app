<script lang="ts">
  import { user } from '$lib/stores/user';
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

  <!-- Header -->
  <div class="mb-10">
    <h1 class="text-2xl font-semibold text-zinc-900 tracking-tight">
      Bonjour, {$user?.username ?? 'Utilisateur'}
    </h1>
    <p class="mt-1 text-sm text-zinc-500">Bienvenue sur votre tableau de bord VitiLink.</p>
  </div>

  <!-- Stats rapides -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
    {#each [
      { label: 'Annonces actives', value: '—', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'Contacts', value: '—', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'Messages', value: '—', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { label: 'Documents', value: '—', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ] as stat}
      <div class="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d={stat.icon} />
          </svg>
        </div>
        <div>
          <div class="text-xl font-semibold text-zinc-900">{stat.value}</div>
          <div class="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Contenu principal -->
  <div class="grid lg:grid-cols-3 gap-6">

    <!-- Activité récente -->
    <div class="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-zinc-900">Activité récente</h2>
        <span class="text-xs text-zinc-400">Bientôt disponible</span>
      </div>
      <div class="flex flex-col items-center justify-center py-16 text-center px-6">
        <div class="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-zinc-500">Aucune activité pour le moment</p>
        <p class="text-xs text-zinc-400 mt-1">Votre fil sera alimenté dès que vous serez actif sur la plateforme.</p>
      </div>
    </div>

    <!-- Profil rapide -->
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-zinc-100">
        <h2 class="text-sm font-semibold text-zinc-900">Mon profil</h2>
      </div>
      <div class="p-6 flex flex-col items-center text-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center ring-2 ring-brand-200/60">
          <span class="text-2xl font-bold text-brand-700">
            {($user?.username ?? 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div class="font-semibold text-zinc-900">{$user?.username ?? '—'}</div>
          <div class="text-xs text-zinc-500 mt-0.5">{$user?.email ?? '—'}</div>
        </div>
        <a
          href="/home/profil"
          class="mt-2 w-full py-2.5 px-4 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700
                 hover:bg-zinc-50 hover:border-zinc-300 transition text-center"
        >
          Voir mon profil
        </a>
      </div>
    </div>

  </div>
</div>
