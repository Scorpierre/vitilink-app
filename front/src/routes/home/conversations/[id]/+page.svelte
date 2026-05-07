<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { ConversationAPI } from '$lib/api/conversation';
  import { AuthAPI } from '$lib/api/auth';
  import { imageUrl, formatPrice } from '$lib/utils/annonce';
  import { getSocket } from '$lib/socket';
  import { user } from '$lib/stores/user';
  import type { Conversation, Message, User, ConversationParticipant } from '$lib/types';

  const { data } = $props<{ data: { conversationId: string } }>();
  const conversationId = data.conversationId;

  let conversation = $state<Conversation | null>(null);
  let messages = $state<Message[]>([]);
  let newMessage = $state('');
  let loading = $state(true);
  let error = $state('');
  let sending = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let currentUser = $state<User | null>(null);
  let textarea = $state<HTMLTextAreaElement | null>(null);

  function displayName(p?: ConversationParticipant | null): string {
    if (!p) return 'Inconnu';
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return p.username;
  }

  function initials(p?: ConversationParticipant | null): string {
    if (!p) return '?';
    const first = p.firstName?.[0] ?? p.username[0];
    const last = p.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  }

  function msgTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function msgDay(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function showDaySeparator(messages: Message[], index: number): boolean {
    if (index === 0) return true;
    return new Date(messages[index].createdAt).toDateString() !==
           new Date(messages[index - 1].createdAt).toDateString();
  }

  async function scrollToBottom(smooth = false) {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
    }
  }

  function autoResize() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  onMount(async () => {
    if (!browser) return;
    try {
      const [convData, meData] = await Promise.all([
        ConversationAPI.findOne(conversationId),
        AuthAPI.me().catch(() => null),
      ]);

      conversation = convData;
      messages = conversation.messages;
      currentUser = meData?.result ?? null;
      if (currentUser) user.setUser(currentUser);

      const socket = await getSocket();
      socket.emit('joinConversation', conversationId);

      socket.on('newMessage', (msg: Message) => {
        messages = [...messages, msg];
        scrollToBottom(true);
      });

      await scrollToBottom();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  onDestroy(async () => {
    if (!browser) return;
    const socket = await getSocket();
    socket.emit('leaveConversation', conversationId);
  });

  async function sendMessage() {
    const content = newMessage.trim();
    if (!content || sending || !browser) return;
    sending = true;
    try {
      const socket = await getSocket();
      socket.emit('sendMessage', { conversationId, content });
      newMessage = '';
      if (textarea) {
        textarea.style.height = 'auto';
      }
    } finally {
      sending = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="flex flex-col overflow-hidden" style="height: calc(100vh - 76px); background: rgb(var(--bg))">

  <!-- Header -->
  <div class="shrink-0 border-b bg-white px-4 py-3 shadow-sm" style="border-color: rgb(var(--border))">
    <div class="mx-auto flex max-w-2xl items-center gap-3">
      <button
        type="button"
        onclick={() => goto('/home/conversations')}
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-zinc-100"
        aria-label="Retour"
      >
        <svg class="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {#if conversation}
        {@const other = currentUser?.id === conversation.buyerId ? conversation.annonce.creator : conversation.buyer}
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
             style="background: linear-gradient(135deg, rgb(var(--primary-700)), rgb(var(--primary-400)))">
          {initials(other)}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-zinc-900">{displayName(other)}</p>
          <a
            href="/home/annonces/{conversation.annonce.id}"
            class="truncate text-xs hover:underline"
            style="color: rgb(var(--primary-600))"
          >
            {conversation.annonce.title}
          </a>
        </div>
      {:else}
        <div class="h-4 w-40 animate-pulse rounded-full bg-zinc-100"></div>
      {/if}
    </div>
  </div>

  <!-- Bannière annonce -->
  {#if conversation}
    <a
      href="/home/annonces/{conversation.annonce.id}"
      class="group shrink-0 flex items-center gap-3 border-b px-4 py-3 transition hover:bg-[rgb(var(--primary-50))]"
      style="border-color: rgb(var(--border)); background: rgb(var(--primary-50)/0.4)"
    >
      <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border"
           style="border-color: rgb(var(--border))">
        {#if conversation.annonce.images?.[0]}
          <img
            src={imageUrl(conversation.annonce.images[0])}
            alt={conversation.annonce.title}
            class="h-full w-full object-cover"
          />
        {:else}
          <div class="flex h-full w-full items-center justify-center text-xs font-semibold"
               style="background: rgb(var(--primary-100)); color: rgb(var(--primary-700))">
            VL
          </div>
        {/if}
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-zinc-900 group-hover:underline">
          {conversation.annonce.title}
        </p>
        <p class="mt-0.5 text-xs font-medium" style="color: rgb(var(--primary-600))">
          {formatPrice(conversation.annonce.price ?? undefined)}
        </p>
      </div>

      <div class="shrink-0 flex items-center gap-1 text-xs font-medium"
           style="color: rgb(var(--primary-600))">
        Voir l'annonce
        <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </a>
  {/if}

  <!-- Messages -->
  <div bind:this={messagesContainer} class="flex-1 overflow-y-auto px-4 py-6">
    <div class="mx-auto max-w-2xl space-y-1">

      {#if loading}
        <div class="flex justify-center py-12">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200"
               style="border-top-color: rgb(var(--primary-500))"></div>
        </div>

      {:else if error}
        <p class="text-center text-sm text-red-500">{error}</p>

      {:else if messages.length === 0}
        <div class="py-16 text-center">
          <p class="text-sm font-medium text-zinc-500">Démarrez la conversation</p>
          <p class="mt-1 text-xs text-zinc-400">Envoyez votre premier message ci-dessous.</p>
        </div>

      {:else}
        {#each messages as msg, i}
          {@const isMe = msg.senderId === currentUser?.id}

          {#if showDaySeparator(messages, i)}
            <div class="flex items-center gap-3 py-4">
              <div class="h-px flex-1" style="background: rgb(var(--border))"></div>
              <span class="text-xs font-medium" style="color: rgb(var(--muted))">{msgDay(msg.createdAt)}</span>
              <div class="h-px flex-1" style="background: rgb(var(--border))"></div>
            </div>
          {/if}

          <div class="flex {isMe ? 'justify-end' : 'justify-start'} px-1">
            <div class="group flex max-w-[72%] flex-col {isMe ? 'items-end' : 'items-start'}">
              <div class="rounded-2xl px-4 py-2.5 {isMe
                ? 'rounded-br-md text-white'
                : 'rounded-bl-md text-zinc-800 border'}"
                   style="{isMe
                     ? 'background: linear-gradient(135deg, rgb(var(--primary-700)), rgb(var(--primary-500))); box-shadow: 0 4px 12px rgba(124,58,237,0.2)'
                     : 'background: white; border-color: rgb(var(--border))'}"
              >
                <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              <span class="mt-1 px-1 text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
                    style="color: rgb(var(--muted))">
                {msgTime(msg.createdAt)}
              </span>
            </div>
          </div>
        {/each}
      {/if}

    </div>
  </div>

  <!-- Input bar -->
  <div class="shrink-0 border-t bg-white px-4 py-3" style="border-color: rgb(var(--border))">
    <div class="mx-auto flex max-w-2xl items-end gap-3">
      <textarea
        bind:this={textarea}
        bind:value={newMessage}
        onkeydown={handleKeydown}
        oninput={autoResize}
        placeholder="Écrire un message..."
        rows="1"
        class="input-soft flex-1 resize-none py-2.5 leading-relaxed"
        style="min-height: 44px; max-height: 120px"
      ></textarea>
      <button
        type="button"
        onclick={sendMessage}
        disabled={!newMessage.trim() || sending}
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition disabled:opacity-40"
        style="background: linear-gradient(135deg, rgb(var(--primary-700)), rgb(var(--primary-500))); box-shadow: 0 6px 16px rgba(124,58,237,0.25)"
        aria-label="Envoyer"
      >
        {#if sending}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
        {:else}
          <svg class="h-5 w-5 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

</div>
