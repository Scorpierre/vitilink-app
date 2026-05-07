<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { ConversationAPI } from '$lib/api/conversation';
  import { AuthAPI } from '$lib/api/auth';
  import { getSocket } from '$lib/socket';
  import { user } from '$lib/stores/user';
  import type { Conversation, Message, User, ConversationParticipant } from '$lib/types';

  let conversations = $state<Conversation[]>([]);
  let loading = $state(true);
  let error = $state('');
  let currentUser = $state<User | null>(null);

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

      const socket = await getSocket();
      for (const conv of conversations) {
        socket.emit('joinConversation', conv.id);
      }

      socket.on('newMessage', (msg: Message) => {
        conversations = conversations.map((conv) => {
          if (conv.id !== msg.conversationId) return conv;
          return { ...conv, messages: [msg], updatedAt: msg.createdAt };
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  onDestroy(async () => {
    if (!browser) return;
    const socket = await getSocket();
    for (const conv of conversations) {
      socket.emit('leaveConversation', conv.id);
    }
  });
</script>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">

  <div class="mb-8">
    <h1 class="text-2xl font-semibold text-zinc-950">Messages</h1>
    <p class="mt-1 text-sm" style="color: rgb(var(--muted))">
      {#if !loading}
        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
      {/if}
    </p>
  </div>

  {#if loading}
    <div class="space-y-3">
      {#each [1, 2, 3] as _}
        <div class="card p-4 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-zinc-100 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3.5 w-1/3 rounded-full bg-zinc-100"></div>
              <div class="h-3 w-2/3 rounded-full bg-zinc-100"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>

  {:else if error}
    <div class="card p-6 text-center">
      <p class="text-sm text-red-500">{error}</p>
    </div>

  {:else if conversations.length === 0}
    <div class="card p-12 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
           style="background: rgb(var(--primary-100))">
        <svg class="h-7 w-7" style="color: rgb(var(--primary-600))" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <p class="font-medium text-zinc-800">Aucune conversation</p>
      <p class="mt-1 text-sm" style="color: rgb(var(--muted))">Contactez un producteur depuis une annonce pour démarrer.</p>
      <a href="/home/marche" class="btn-primary mt-5 inline-flex">Voir les annonces</a>
    </div>

  {:else}
    <div class="card overflow-hidden">
      {#each conversations as conv, i}
        {@const other = currentUser?.id === conv.buyerId ? conv.annonce.creator : conv.buyer}
        {@const last = conv.messages[0] ?? null}
        {@const unread = !!last && last.senderId !== currentUser?.id}
        <button
          type="button"
          onclick={() => goto(`/home/conversations/${conv.id}`)}
          class="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[rgb(var(--primary-50))] {i > 0 ? 'border-t border-[rgb(var(--border))]' : ''}"
        >
          <div class="relative shrink-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                 style="background: linear-gradient(135deg, rgb(var(--primary-700)), rgb(var(--primary-400)))">
              {initials(other)}
            </div>
            {#if unread}
              <span class="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
                    style="background: rgb(var(--primary-500))"></span>
            {/if}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <p class="truncate text-sm font-semibold {unread ? 'text-zinc-950' : 'text-zinc-700'}">
                {displayName(other)}
              </p>
              <span class="shrink-0 text-xs {unread ? 'font-semibold' : 'font-normal'}"
                    style="color: {unread ? 'rgb(var(--primary-600))' : 'rgb(var(--muted))'}">
                {relativeTime(conv.updatedAt)}
              </span>
            </div>

            <p class="mt-0.5 truncate text-xs font-medium" style="color: rgb(var(--primary-700))">
              {conv.annonce.title}
            </p>

            <p class="mt-0.5 truncate text-sm {unread ? 'font-medium text-zinc-800' : 'text-zinc-500'}">
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

          <svg class="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      {/each}
    </div>
  {/if}

</div>
