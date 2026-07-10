<script lang="ts">
  export let title = 'Chargement en cours';
  export let text = 'Nous récupérons les informations utiles.';
  export let compact = false;
  export let className = '';

  const steps = ['Connexion sécurisée', 'Données métier', 'Interface'];
</script>

<div
  class={`relative isolate overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm ${
    compact ? 'px-5 py-8' : 'px-5 py-14 sm:px-8 sm:py-16'
  } ${className}`}
  role="status"
  aria-live="polite"
>
  <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(139,92,246,0.12),transparent_30%),linear-gradient(135deg,#ffffff_0%,#fbfaf8_48%,#f3eef8_100%)]"></div>
  <div class="absolute -right-12 -top-16 -z-10 h-40 w-40 rounded-full bg-violet-200/35 blur-3xl"></div>

  <div class="mx-auto flex max-w-xl flex-col items-center text-center">
    <div class="relative grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-[0_18px_42px_rgba(36,21,47,0.14)] ring-1 ring-violet-100">
      <span class="absolute inset-[-6px] rounded-[1.35rem] border-2 border-violet-100 border-t-violet-600 motion-safe:animate-spin"></span>
      <img src="/logo/icon_vitilink.png" alt="" class="h-10 w-10 rounded-xl object-cover" />
    </div>

    <h2 class="mt-5 text-lg font-semibold text-[#24152f]">{title}</h2>
    <p class="mt-2 max-w-md text-sm leading-6 text-zinc-500">{text}</p>

    <div class="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-3" aria-hidden="true">
      {#each steps as step, index}
        <div class="rounded-lg border border-violet-100 bg-white/80 px-3 py-2 text-left shadow-sm">
          <div class="flex items-center gap-2">
            <span
              class="h-1.5 w-1.5 rounded-full bg-violet-600 motion-safe:animate-pulse"
              style={`animation-delay: ${index * 140}ms`}
            ></span>
            <span class="truncate text-[11px] font-semibold text-zinc-500">{step}</span>
          </div>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-violet-50">
            <div
              class="loading-progress-bar h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300"
              style={`animation-delay: ${index * 150}ms`}
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
