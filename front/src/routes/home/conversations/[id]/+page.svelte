<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { ConversationAPI } from '$lib/api/conversation';
  import { AuthAPI } from '$lib/api/auth';
  import { getSocket } from '$lib/socket';
  import { user } from '$lib/stores/user';
  import type { Conversation, Message, User } from '$lib/types';

  const { data } = $props<{ data: { conversationId: string } }>();
  const conversationId = data.conversationId;

  let conversation = $state<Conversation | null>(null);
  let messages = $state<Message[]>([]);
  let newMessage = $state('');
  let loading = $state(true);
  let error = $state('');
  let messagesEnd = $state<HTMLDivElement | null>(null);
  let currentUser = $state<User | null>(null);

  function scrollToBottom() {
    messagesEnd?.scrollIntoView({ behavior: 'smooth' });
  }

  onMount(async () => {
    if (!browser) return;
    try {
      const [conversationData, meData] = await Promise.all([
        ConversationAPI.findOne(conversationId),
        AuthAPI.me().catch(() => null),
      ]);

      conversation = conversationData;
      messages = conversation.messages;
      currentUser = meData?.result ?? null;
      if (currentUser) user.setUser(currentUser);

      const socket = await getSocket();

      socket.emit('joinConversation', conversationId);

      socket.on('newMessage', (msg: Message) => {
        messages = [...messages, msg];
        setTimeout(scrollToBottom, 50);
      });

      setTimeout(scrollToBottom, 50);
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
    if (!newMessage.trim() || !browser) return;

    const socket = await getSocket();

    socket.emit('sendMessage', { conversationId, content: newMessage.trim() });
    newMessage = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="flex flex-col h-screen max-w-2xl mx-auto p-4">
  {#if loading}
    <p class="text-gray-500">Chargement...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <div class="mb-4 border-b pb-3">
      <h1 class="text-xl font-bold">{conversation?.annonce.title}</h1>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 mb-4">
      {#each messages as msg}
        <div class="flex {msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}">
          <div class="max-w-xs px-4 py-2 rounded-lg {msg.senderId === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}">
            <p class="text-xs font-semibold mb-1 {msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}">
              {msg.sender.username}
            </p>
            <p>{msg.content}</p>
          </div>
        </div>
      {/each}
      <div bind:this={messagesEnd}></div>
    </div>

    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newMessage}
        onkeydown={handleKeydown}
        placeholder="Écrire un message..."
        class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onclick={sendMessage}
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Envoyer
      </button>
    </div>
  {/if}
</div>
