<script lang="ts">
  import Navbar from '$lib/components/app/Navbar.svelte';
  import Footer from '$lib/components/app/Footer.svelte';
</script>

<Navbar />
<main class="min-h-screen pt-16 bg-stone-50">
  <slot />
</main>
<Footer />
