<script lang="ts">
  import { DEMO_MODE } from '$lib/demo/mode';
  import { resetDemo } from '$lib/demo/db';

  let open = false;

  function reset() {
    resetDemo();
    window.location.href = '/';
  }
</script>

{#if DEMO_MODE}
  <div class="fixed bottom-4 left-4 z-[70] max-w-[calc(100vw-2rem)]">
    {#if open}
      <div class="mb-2 w-72 max-w-full rounded-lg border border-violet-100 bg-white p-4 text-xs leading-relaxed text-zinc-600 shadow-[0_20px_50px_rgba(40,18,68,0.18)]">
        <p class="font-semibold text-[#24152f]">Mode démo</p>
        <p class="mt-1.5">
          Aucun serveur réel : tout (connexion, annonces, messages, paiement) est simulé dans votre navigateur.
          Connectez-vous avec n'importe quel email/mot de passe.
        </p>
        <button
          type="button"
          on:click={reset}
          class="mt-3 w-full rounded-lg bg-[#5b2df2] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4b22ce]"
        >
          Réinitialiser la démo
        </button>
      </div>
    {/if}

    <button
      type="button"
      on:click={() => (open = !open)}
      class="flex items-center gap-2 rounded-full bg-[#24152f] px-3 py-2 text-xs font-semibold text-violet-100 shadow-[0_14px_36px_rgba(40,18,68,0.28)] transition hover:bg-[#2d1b3d]"
    >
      🎭 Démo
    </button>
  </div>
{/if}
