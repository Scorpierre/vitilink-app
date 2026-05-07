<script lang="ts">
  import Navbar from '$lib/components/app/Navbar.svelte';
  import Footer from '$lib/components/app/Footer.svelte';
</script>

<Navbar />

<main class="min-h-screen pt-[76px] bg-[linear-gradient(180deg,#fcfbff_0%,#f9f6ff_45%,#fcfbff_100%)]">
  <slot />
</main>

<Footer />