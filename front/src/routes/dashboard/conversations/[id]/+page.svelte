<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { ConversationAPI } from '$lib/api/conversation';
  import { AuthAPI } from '$lib/api/auth';
  import { PaymentAPI } from '$lib/api/payment';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import { imageUrl, formatPrice } from '$lib/utils/annonce';
  import { user } from '$lib/stores/user';
  import type { Conversation, Message, Order, User, ConversationParticipant } from '$lib/types';

  type RealtimeMessage = Message & {
    clientId?: string;
    localId?: string;
    pending?: boolean;
    failed?: boolean;
    justArrived?: boolean;
  };

  const receivableStatuses = ['PAID', 'SHIPPED'];
  const { data } = $props<{ data: { conversationId: string } }>();
  const conversationId = data.conversationId;

  let conversation = $state<Conversation | null>(null);
  let messages = $state<RealtimeMessage[]>([]);
  let orders = $state<Order[]>([]);
  let newMessage = $state('');
  let loading = $state(true);
  let loadError = $state('');
  let sendError = $state('');
  let receiptError = $state('');
  let sending = $state(false);
  let receiptLoading = $state(false);
  let syncing = $state(false);
  let socketReady = $state(false);
  let messagesContainer = $state<HTMLDivElement | null>(null);
  let currentUser = $state<User | null>(null);
  let textarea = $state<HTMLTextAreaElement | null>(null);
  let socket: any = null;
  let pollTimer: number | null = null;
  let handleSocketConnect: (() => void) | null = null;
  let handleSocketDisconnect: (() => void) | null = null;
  let handleSocketNewMessage: ((message: RealtimeMessage) => void) | null = null;
  let handleSocketMessageError: ((payload: { clientId?: string; message?: string }) => void) | null = null;
  let lastScrollKey = '';

  let linkedOrder = $derived(
    conversation && currentUser
      ? orders.find(
          (order) =>
            order.annonceId === conversation?.annonce.id &&
            order.buyerUserId === currentUser?.id &&
            (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'),
        ) ?? null
      : null,
  );
  let canConfirmReceipt = $derived(
    Boolean(linkedOrder && receivableStatuses.includes(linkedOrder.status)),
  );

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
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  $effect(() => {
    if (loading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    const key = `${messages.length}:${last.localId ?? last.id}:${last.pending ? 'pending' : 'sent'}`;
    if (key === lastScrollKey) return;

    lastScrollKey = key;
    void scrollToBottom(Boolean(last.pending || last.justArrived));
  });

  function autoResize() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  function appendOrReplaceMessage(message: RealtimeMessage, smooth = true) {
    sendError = '';

    const existingIndex = messages.findIndex(
      (item) =>
        item.id === message.id ||
        (message.clientId && (item.localId === message.clientId || item.clientId === message.clientId)),
    );

    const normalized = {
      ...message,
      pending: false,
      failed: false,
      justArrived: existingIndex === -1,
    };

    if (existingIndex >= 0) {
      messages = [
        ...messages.slice(0, existingIndex),
        { ...messages[existingIndex], ...normalized },
        ...messages.slice(existingIndex + 1),
      ];
    } else {
      messages = [...messages, normalized];
    }

    void scrollToBottom(smooth);

    if (normalized.justArrived) {
      window.setTimeout(() => {
        messages = messages.map((item) =>
          item.id === normalized.id ? { ...item, justArrived: false } : item,
        );
      }, 650);
    }
  }

  function mergeMessages(nextMessages: Message[]) {
    let changed = false;
    const localMessages = [...messages];

    for (const message of nextMessages) {
      if (localMessages.some((item) => item.id === message.id)) continue;
      const pendingIndex = localMessages.findIndex((item) => {
        if (!item.pending || item.senderId !== message.senderId || item.content !== message.content) {
          return false;
        }

        const delta = Math.abs(new Date(message.createdAt).getTime() - new Date(item.createdAt).getTime());
        return delta < 15000;
      });

      if (pendingIndex >= 0) {
        localMessages[pendingIndex] = {
          ...localMessages[pendingIndex],
          ...message,
          pending: false,
          failed: false,
          justArrived: false,
        };
        continue;
      }

      localMessages.push({ ...message, justArrived: true });
      changed = true;
    }

    const pendingMessages = localMessages.filter((item) => item.pending);
    const persistedMessages = localMessages.filter((item) => !item.pending);
    persistedMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    messages = [...persistedMessages, ...pendingMessages];

    if (changed) {
      void scrollToBottom(true);
      window.setTimeout(() => {
        messages = messages.map((item) => ({ ...item, justArrived: false }));
      }, 650);
    }
  }

  async function refreshMessages(silent = false) {
    if (!browser) return;
    if (!silent) syncing = true;
    try {
      const data = await ConversationAPI.findOne(conversationId);
      conversation = data;
      mergeMessages(data.messages);
    } catch {
      // Le socket reste prioritaire ; le polling ne doit pas casser l'écran.
    } finally {
      if (!silent) syncing = false;
    }
  }

  function cleanupSocketListeners() {
    if (!socket) return;
    if (handleSocketConnect) socket.off('connect', handleSocketConnect);
    if (handleSocketDisconnect) socket.off('disconnect', handleSocketDisconnect);
    if (handleSocketNewMessage) socket.off('newMessage', handleSocketNewMessage);
    if (handleSocketMessageError) socket.off('messageError', handleSocketMessageError);

    handleSocketConnect = null;
    handleSocketDisconnect = null;
    handleSocketNewMessage = null;
    handleSocketMessageError = null;
  }

  async function setupRealtime() {
    try {
      const { getSocket } = await import('$lib/socket');
      socket = await getSocket();
      cleanupSocketListeners();

      socket.emit('joinConversation', conversationId);
      socketReady = socket.connected;

      handleSocketConnect = () => {
        socketReady = true;
        socket.emit('joinConversation', conversationId);
        void refreshMessages(true);
      };
      handleSocketDisconnect = () => {
        socketReady = false;
      };
      handleSocketNewMessage = (message: RealtimeMessage) => {
        appendOrReplaceMessage(message);
      };
      handleSocketMessageError = (payload: { clientId?: string; message?: string }) => {
        if (!payload.clientId) {
          sendError = payload.message ?? "Impossible d'envoyer le message.";
          return;
        }

        messages = messages.map((item) =>
          item.localId === payload.clientId
            ? { ...item, pending: false, failed: true }
            : item,
        );
        sendError = payload.message ?? "Impossible d'envoyer le message.";
      };

      socket.on('connect', handleSocketConnect);
      socket.on('disconnect', handleSocketDisconnect);
      socket.on('newMessage', handleSocketNewMessage);
      socket.on('messageError', handleSocketMessageError);
    } catch {
      socketReady = false;
    }
  }

  function startPolling() {
    pollTimer = window.setInterval(() => {
      void refreshMessages(true);
    }, socketReady ? 8000 : 2500);
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
      orders = await PaymentAPI.findMyOrders().catch(() => []);
      if (currentUser) user.setUser(currentUser);

      await setupRealtime();
      startPolling();
    } catch (e: any) {
      loadError = e.message;
    } finally {
      loading = false;
      await scrollToBottom();
    }
  });

  onDestroy(() => {
    if (!browser) return;
    if (pollTimer) window.clearInterval(pollTimer);
    if (socket) {
      socket.emit('leaveConversation', conversationId);
      cleanupSocketListeners();
    }
  });

  async function sendMessage() {
    const content = newMessage.trim();
    if (!content || sending || !browser) return;
    if (!currentUser) {
      sendError = 'Utilisateur non connecté.';
      return;
    }
    sendError = '';

    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMessage: RealtimeMessage = {
      id: clientId,
      localId: clientId,
      content,
      senderId: currentUser.id,
      sender: { id: currentUser.id, username: currentUser.username },
      conversationId,
      createdAt: new Date().toISOString(),
      pending: true,
      justArrived: true,
    };

    messages = [...messages, optimisticMessage];
    newMessage = '';
    if (textarea) {
      textarea.style.height = 'auto';
    }
    await scrollToBottom(true);

    sending = true;
    try {
      if (!socket) await setupRealtime();
      if (!socket) throw new Error('Messagerie temps réel indisponible.');

      socket.emit('sendMessage', { conversationId, content, clientId });

      window.setTimeout(() => {
        const stillPending = messages.some((item) => item.localId === clientId && item.pending);
        if (stillPending) void refreshMessages(true);
      }, 1200);
    } catch (e) {
      messages = messages.map((item) => (
        item.localId === clientId ? { ...item, pending: false, failed: true } : item
      ));
      if (e instanceof Error) {
        sendError = e.message;
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

  async function confirmReceipt() {
    if (!linkedOrder || !canConfirmReceipt) return;
    receiptLoading = true;
    receiptError = '';

    try {
      const updated = await PaymentAPI.confirmDelivery(linkedOrder.id);
      orders = orders.map((order) => (order.id === updated.id ? updated : order));
    } catch (e) {
      receiptError = e instanceof Error ? e.message : 'Impossible de valider la réception.';
    } finally {
      receiptLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Conversation - VitiLink</title>
</svelte:head>

<div class="flex h-[calc(100svh-88px)] flex-col overflow-hidden bg-[linear-gradient(180deg,#fbfaf8_0%,#f2edf7_100%)]">
  <div class="shrink-0 border-b border-violet-100 bg-white/88 px-4 py-3 shadow-sm backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center gap-3">
      <button
        type="button"
        onclick={() => goto('/dashboard/conversations')}
        class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-violet-100 bg-white text-zinc-600 transition hover:-translate-x-0.5 hover:bg-violet-50 hover:text-violet-800"
        aria-label="Retour"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {#if conversation}
        {@const other = currentUser?.id === conversation.buyerId ? conversation.annonce.creator : conversation.buyer}
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#5b2df2] to-[#8b5cf6] text-sm font-bold text-white shadow-sm">
          {initials(other)}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-[#24152f]">{displayName(other)}</p>
          <a
            href={`/dashboard/annonces/${conversation.annonce.id}`}
            class="truncate text-xs font-semibold text-violet-700 hover:underline"
          >
            {conversation.annonce.title}
          </a>
        </div>
      {:else}
        <div class="h-4 w-40 animate-pulse rounded-full bg-zinc-100"></div>
      {/if}
    </div>
  </div>

  {#if conversation}
    <div class="shrink-0 border-b border-violet-100 bg-[#fbfaf8]/92 px-4 py-3 backdrop-blur">
      <div
        class="group mx-auto flex max-w-6xl flex-col gap-3 rounded-lg border border-violet-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_42px_rgba(48,22,75,0.10)] sm:flex-row sm:items-center"
      >
        <a href={`/dashboard/annonces/${conversation.annonce.id}`} class="flex min-w-0 flex-1 items-center gap-3">
          <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-violet-50">
            {#if conversation.annonce.images?.[0]}
              <img
                src={imageUrl(conversation.annonce.images[0])}
                alt={conversation.annonce.title}
                class="h-full w-full object-cover"
              />
            {:else}
              <div class="grid h-full w-full place-items-center text-sm font-bold text-violet-700">
                VL
              </div>
            {/if}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Annonce liée
              </span>
              <span class="text-xs font-medium text-zinc-400">Contexte de l'échange</span>
            </div>
            <p class="mt-2 truncate text-sm font-semibold text-[#24152f] group-hover:underline">
              {conversation.annonce.title}
            </p>
            <p class="mt-1 text-xs font-semibold text-violet-700">
              {formatPrice(conversation.annonce.price ?? undefined)}
            </p>
          </div>
        </a>

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          {#if linkedOrder?.status === 'DELIVERED'}
            <span class="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Réception validée
            </span>
          {:else if canConfirmReceipt}
            <button
              type="button"
              onclick={confirmReceipt}
              disabled={receiptLoading}
              class="inline-flex items-center justify-center rounded-lg bg-[#5b2df2] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4b22ce] disabled:pointer-events-none disabled:opacity-50"
            >
              {receiptLoading ? 'Validation...' : 'Valider la réception'}
            </button>
          {/if}

          <a
            href={`/dashboard/annonces/${conversation.annonce.id}`}
            class="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100"
          >
            Voir l'annonce
            <svg class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>
      </div>
      {#if receiptError}
        <div class="mx-auto mt-2 max-w-6xl rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {receiptError}
        </div>
      {/if}
    </div>
  {/if}

  <div bind:this={messagesContainer} class="flex-1 overflow-y-auto px-4 py-6">
    <div class="mx-auto max-w-4xl space-y-1">
      {#if loading}
        <LoadingState
          compact
          title="Chargement de la conversation"
          text="Nous récupérons les messages et le contexte de l’annonce."
        />
      {:else if loadError}
        <div class="mx-auto max-w-lg rounded-lg border border-rose-100 bg-rose-50 p-5 text-center text-sm font-medium text-rose-700">
          {loadError}
        </div>
      {:else if messages.length === 0}
        <div class="py-16 text-center">
          <div class="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-violet-100 text-violet-800">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H12l-4.5 4v-4A3.5 3.5 0 0 1 4 11.5v-5Z" />
            </svg>
          </div>
          <p class="mt-5 text-sm font-semibold text-[#24152f]">Démarrez la conversation</p>
          <p class="mt-1 text-sm text-zinc-500">Envoyez votre premier message ci-dessous.</p>
        </div>
      {:else}
        {#each messages as msg, i (msg.localId ?? msg.id)}
          {@const isMe = msg.senderId === currentUser?.id}

          {#if showDaySeparator(messages, i)}
            <div class="flex items-center gap-3 py-5">
              <div class="h-px flex-1 bg-violet-100"></div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-violet-100">
                {msgDay(msg.createdAt)}
              </span>
              <div class="h-px flex-1 bg-violet-100"></div>
            </div>
          {/if}

          <div class={`message-row flex px-1 ${isMe ? 'justify-end' : 'justify-start'} ${msg.justArrived ? 'message-row-enter' : ''}`}>
            <div class={`group flex max-w-[78%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                class={`rounded-lg px-4 py-3 ${msg.pending ? 'message-pending' : ''} ${
                  msg.failed
                    ? 'border border-red-200 bg-red-50 text-red-700'
                    :
                  isMe
                    ? 'rounded-br-sm bg-gradient-to-br from-[#5b2df2] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(91,45,242,0.20)]'
                    : 'rounded-bl-sm border border-violet-100 bg-white text-zinc-800 shadow-sm'
                }`}
              >
                <p class="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
              </div>
              <span class={`mt-1 px-1 text-[11px] ${msg.failed ? 'text-red-500 opacity-100' : msg.pending ? 'text-violet-500 opacity-100' : 'text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100'}`}>
                {#if msg.failed}
                  Non envoyé
                {:else if msg.pending}
                  Envoi...
                {:else}
                  {msgTime(msg.createdAt)}
                {/if}
              </span>
            </div>
          </div>
        {/each}
        {#if syncing}
          <div class="flex justify-center py-3">
            <span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500"></span>
              Synchronisation
            </span>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="shrink-0 border-t border-violet-100 bg-white/92 px-4 py-3 backdrop-blur-xl">
    <div class="mx-auto flex max-w-4xl items-end gap-3">
      <textarea
        bind:this={textarea}
        bind:value={newMessage}
        onkeydown={handleKeydown}
        oninput={autoResize}
        placeholder="Écrire un message..."
        rows="1"
        class="min-h-11 max-h-[120px] flex-1 resize-none rounded-lg border border-violet-100 bg-[#fbfaf8] px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
      ></textarea>
      <button
        type="button"
        onclick={sendMessage}
        disabled={!newMessage.trim() || sending}
        class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#5b2df2] text-white shadow-[0_10px_24px_rgba(91,45,242,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4b22ce] disabled:pointer-events-none disabled:opacity-40"
        aria-label="Envoyer"
      >
        {#if sending}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
        {:else}
          <svg class="h-5 w-5 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.27 3.13A59.77 59.77 0 0 1 21.49 12 59.77 59.77 0 0 1 3.27 20.87L6 12Zm0 0h7.5" />
          </svg>
        {/if}
      </button>
    </div>
    <div class="mx-auto mt-2 flex max-w-4xl items-center justify-between gap-3 px-1 text-[11px] text-zinc-400">
      <span>{socketReady ? 'Temps réel actif' : 'Synchronisation automatique'}</span>
      <span>Entrée pour envoyer · Maj+Entrée pour une ligne</span>
    </div>
    {#if sendError}
      <div class="mx-auto mt-2 max-w-4xl rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
        {sendError}
      </div>
    {/if}
  </div>
</div>

<style>
  .message-row-enter {
    animation: message-in 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .message-pending {
    position: relative;
    overflow: hidden;
  }

  .message-pending::after {
    animation: message-pending 1.2s ease-in-out infinite;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.2), transparent);
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
    transform: translateX(-100%);
  }

  @keyframes message-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes message-pending {
    to {
      transform: translateX(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .message-row-enter,
    .message-pending::after {
      animation: none;
    }
  }
</style>
