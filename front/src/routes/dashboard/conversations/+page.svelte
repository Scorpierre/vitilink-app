<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { ConversationAPI } from '$lib/api/conversation';
  import { AuthAPI } from '$lib/api/auth';
  import { user } from '$lib/stores/user';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import type { Conversation, User, ConversationParticipant } from '$lib/types';

  let conversations = $state<Conversation[]>([]);
  let loading = $state(true);
  let error = $state('');
  let currentUser = $state<User | null>(null);
  let query = $state('');

  let filteredConversations = $derived(
    conversations.filter((conv) => {
      const other = currentUser?.id === conv.buyerId ? conv.annonce.creator : conv.buyer;
      const target = `${displayName(other)} ${conv.annonce.title} ${conv.messages[0]?.content ?? ''}`.toLowerCase();
      return target.includes(query.trim().toLowerCase());
    }),
  );

  let unreadCount = $derived(
    conversations.filter((conv) => {
      const last = conv.messages[0] ?? null;
      return !!last && last.senderId !== currentUser?.id;
    }).length,
  );

  function initials(p?: ConversationParticipant | null): string {
    if (!p) return '?';
    const first = p.firstName?.[0] ?? p.username[0];
    const last = p.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  function displayName(p?: ConversationParticipant | null): string {
    if (!p) return 'Inconnu';
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return p.username;
  }

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "À l'instant";
    if (min < 60) return `il y a ${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Hier';
    if (d < 7) return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long' });
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  onMount(async () => {
    if (!browser) return;
    try {
      const [convData, meData] = await Promise.all([
        ConversationAPI.findAll(),
        AuthAPI.me().catch(() => null),
      ]);
      conversations = convData;
      currentUser = meData?.result ?? null;
      if (currentUser) user.setUser(currentUser);
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

</script>

<svelte:head>
  <title>Messages - VitiLink</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
  <section class="relative isolate overflow-hidden rounded-lg border border-white bg-[#24152f] px-5 py-6 text-white shadow-[0_22px_70px_rgba(36,21,47,0.16)] sm:px-7">
    <img
      src="/assets/images/image-recolte.jpeg"
      alt=""
      class="absolute inset-y-0 right-0 -z-20 hidden h-full w-1/2 object-cover opacity-70 lg:block"
    />
    <div class="absolute inset-0 -z-10 bg-[linear-gradient(105deg,#24152f_0%,rgba(36,21,47,0.96)_48%,rgba(36,21,47,0.36)_100%)]"></div>
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">Messagerie</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Suivre les échanges sans perdre le contexte.</h1>
      <p class="mt-3 text-sm leading-7 text-white/72 sm:text-base">
        Retrouvez les discussions liées aux annonces, les contacts actifs et les messages à traiter.
      </p>
    </div>
  </section>

  <section class="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
    <div class="rounded-lg border border-violet-100 bg-white shadow-sm">
      <div class="border-b border-violet-100 p-4 sm:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-[#24152f]">Conversations</h2>
            <p class="mt-1 text-sm text-zinc-500">
              {#if loading}
                Chargement des échanges
              {:else}
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}, {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
              {/if}
            </p>
          </div>

          <label class="relative block w-full lg:w-80">
            <span class="sr-only">Rechercher une conversation</span>
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />
            </svg>
            <input
              bind:value={query}
              class="h-11 w-full rounded-lg border border-violet-100 bg-[#fbfaf8] pl-10 pr-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="Rechercher un contact, une annonce..."
            />
          </label>
        </div>
      </div>

      {#if loading}
        <div class="p-4 sm:p-5">
          <LoadingState
            compact
            title="Chargement des conversations"
            text="Nous récupérons vos échanges et les annonces associées."
          />
        </div>
      {:else if error}
        <div class="p-6">
          <div class="rounded-lg border border-rose-100 bg-rose-50 p-5 text-sm font-medium text-rose-700">
            {error}
          </div>
        </div>
      {:else if conversations.length === 0}
        <div class="p-6">
          <div class="rounded-lg border border-violet-100 bg-[#fbfaf8] px-6 py-12 text-center">
            <div class="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-violet-100 text-violet-800">
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H12l-4.5 4v-4A3.5 3.5 0 0 1 4 11.5v-5Z" />
              </svg>
            </div>
            <p class="mt-5 font-semibold text-[#24152f]">Aucune conversation</p>
            <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Contactez un professionnel depuis une annonce pour démarrer un échange.
            </p>
            <a href="/dashboard/marche" class="btn-primary mt-5 inline-flex">Voir les annonces</a>
          </div>
        </div>
      {:else if filteredConversations.length === 0}
        <div class="p-6">
          <div class="rounded-lg border border-zinc-100 bg-[#fbfaf8] px-6 py-10 text-center">
            <p class="font-semibold text-[#24152f]">Aucun résultat</p>
            <p class="mt-2 text-sm text-zinc-500">Essayez avec un autre contact ou une autre annonce.</p>
          </div>
        </div>
      {:else}
        <div class="divide-y divide-zinc-100">
          {#each filteredConversations as conv}
            {@const other = currentUser?.id === conv.buyerId ? conv.annonce.creator : conv.buyer}
            {@const last = conv.messages[0] ?? null}
            {@const unread = !!last && last.senderId !== currentUser?.id}
            <button
              type="button"
              onclick={() => goto(`/dashboard/conversations/${conv.id}`)}
              class={`group flex w-full items-center gap-4 px-4 py-4 text-left transition sm:px-5 ${
                unread ? 'bg-violet-50/55 hover:bg-violet-50' : 'bg-white hover:bg-[#fbfaf8]'
              }`}
            >
              <div class="relative shrink-0">
                <div class="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#5b2df2] to-[#8b5cf6] text-sm font-bold text-white shadow-sm">
                  {initials(other)}
                </div>
                {#if unread}
                  <span class="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400"></span>
                {/if}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class={`truncate text-sm font-semibold ${unread ? 'text-[#24152f]' : 'text-zinc-700'}`}>
                      {displayName(other)}
                    </p>
                    <p class="mt-1 truncate text-xs font-semibold text-violet-700">{conv.annonce.title}</p>
                  </div>
                  <span class={`shrink-0 text-xs ${unread ? 'font-semibold text-violet-800' : 'text-zinc-400'}`}>
                    {relativeTime(conv.updatedAt)}
                  </span>
                </div>

                <p class={`mt-2 truncate text-sm ${unread ? 'font-medium text-zinc-800' : 'text-zinc-500'}`}>
                  {#if last}
                    {#if last.senderId === currentUser?.id}
                      <span class="text-zinc-400">Vous : </span>
                    {/if}
                    {last.content}
                  {:else}
                    <span class="italic text-zinc-400">Aucun message</span>
                  {/if}
                </p>
              </div>

              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-100 bg-white text-zinc-400 transition group-hover:translate-x-0.5 group-hover:border-violet-200 group-hover:text-violet-700">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <aside class="space-y-4">
      <div class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
        <div class="relative h-36">
          <img src="/assets/images/header.jpg" alt="" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/80 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4 text-white">
            <p class="text-sm font-semibold">Contexte annonce</p>
            <p class="mt-1 text-xs text-white/70">Gardez chaque échange rattaché a la bonne opportunité.</p>
          </div>
        </div>
        <div class="grid grid-cols-2 divide-x divide-violet-100">
          <div class="p-4">
            <div class="text-2xl font-semibold text-[#24152f]">{conversations.length}</div>
            <div class="mt-1 text-xs text-zinc-500">Echanges</div>
          </div>
          <div class="p-4">
            <div class="text-2xl font-semibold text-[#24152f]">{unreadCount}</div>
            <div class="mt-1 text-xs text-zinc-500">A traiter</div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-violet-100 bg-[#24152f] p-5 text-white shadow-sm">
        <p class="text-sm font-semibold">Bon réflexe</p>
        <p class="mt-3 text-sm leading-6 text-white/72">
          Répondez avec le volume, le timing et les conditions en premier. Les échanges restent plus courts et plus simples a comparer.
        </p>
        <a
          href="/dashboard/marche"
          class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#24152f] transition hover:bg-violet-50"
        >
          Explorer les annonces
        </a>
      </div>
    </aside>
  </section>
</div>
