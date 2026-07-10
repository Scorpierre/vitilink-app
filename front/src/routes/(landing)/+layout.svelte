<script lang="ts">
  import LandingNav from '$lib/components/app/LandingNav.svelte';
  import LandingFooter from '$lib/components/app/LandingFooter.svelte';
  import PageTransition from '$lib/components/app/PageTransition.svelte';
</script>

<LandingNav />
<PageTransition>
  <slot />
</PageTransition>
<LandingFooter />
