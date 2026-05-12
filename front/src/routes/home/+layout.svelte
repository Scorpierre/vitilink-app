<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { AuthAPI } from '$lib/api/auth';
  import Navbar from '$lib/components/app/Navbar.svelte';
  import Footer from '$lib/components/app/Footer.svelte';

  onMount(async () => {
    try {
      await AuthAPI.me();
    } catch {
      goto('/signIn');
    }
  });
</script>

<Navbar />

<main class="min-h-screen pt-[76px] bg-[linear-gradient(180deg,#fcfbff_0%,#f9f6ff_45%,#fcfbff_100%)]">
  <slot />
</main>

<Footer />