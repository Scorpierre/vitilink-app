<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { AuthAPI } from '$lib/api/auth';
  import Navbar from '$lib/components/app/Navbar.svelte';
  import Footer from '$lib/components/app/Footer.svelte';
  import PageTransition from '$lib/components/app/PageTransition.svelte';
  import { user } from '$lib/stores/user';

  $: isConversationDetail = /^\/dashboard\/conversations\/[^/]+/.test($page.url.pathname);

  onMount(async () => {
    if (get(user)) return;

    try {
      const data = await AuthAPI.me();
      if (data.result) user.setUser(data.result);
    } catch {
      user.clear();
    }
  });
</script>

<Navbar />

<main class="min-h-screen [overflow-x:clip] bg-[linear-gradient(180deg,#fbfaf8_0%,#f3eef8_42%,#fbfaf8_100%)] pt-[88px]">
  <PageTransition>
    <slot />
  </PageTransition>
</main>

{#if !isConversationDetail}
  <Footer />
{/if}
