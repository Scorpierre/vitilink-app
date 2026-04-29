<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ConversationAPI } from '$lib/api/conversation';
  import type { Conversation } from '$lib/types';

  let conversations = $state<Conversation[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      conversations = await ConversationAPI.findAll();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="p-6 max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Mes conversations</h1>

  {#if loading}
    <p class="text-gray-500">Chargement...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else if conversations.length === 0}
    <p class="text-gray-500">Aucune conversation pour l'instant.</p>
  {:else}
    <ul class="space-y-3">
      {#each conversations as conv}
        <li>
          <button
            class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition"
            onclick={() => goto(`/home/conversations/${conv.id}`)}
          >
            <p class="font-semibold">{conv.annonce.title}</p>
            {#if conv.messages[0]}
              <p class="text-sm text-gray-500 truncate">{conv.messages[0].content}</p>
            {:else}
              <p class="text-sm text-gray-400 italic">Aucun message</p>
            {/if}
            <p class="text-xs text-gray-400 mt-1">{new Date(conv.updatedAt).toLocaleDateString()}</p>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
