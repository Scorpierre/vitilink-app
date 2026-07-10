<script lang="ts">
  import { onNavigate } from '$app/navigation';
  import '../app.css';
  import Toast from '$lib/components/app/Toast.svelte';

  type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => Promise<void> | void) => void;
  };

  onNavigate((navigation) => {
    const viewTransitionDocument = document as ViewTransitionDocument;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!viewTransitionDocument.startViewTransition || reducedMotion) return;

    return new Promise<void>((resolve) => {
      viewTransitionDocument.startViewTransition?.(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<slot />
<Toast />
