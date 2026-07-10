<script lang="ts">
  import { page } from '$app/stores';

  $: status = $page.status;
  $: isNotFound = status === 404;
  $: title = isNotFound ? 'Page introuvable' : 'Une erreur est survenue';
  $: text = isNotFound
    ? "La page demandée n'existe pas ou a été déplacée."
    : "Impossible d'afficher cette page pour le moment.";
</script>

<svelte:head>
  <title>{isNotFound ? '404 - VitiLink' : `${status} - VitiLink`}</title>
</svelte:head>

<div class="relative isolate min-h-screen overflow-hidden bg-[#fbfaf8] px-4 py-10 sm:px-6 lg:px-8">
  <img src="/assets/images/header.jpg" alt="" class="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
  <div class="absolute inset-0 -z-10 bg-[linear-gradient(110deg,#fbfaf8_0%,rgba(251,250,248,0.92)_42%,rgba(91,45,242,0.18)_100%)]"></div>

  <main class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
    <section class="grid w-full overflow-hidden rounded-[2rem] border border-white bg-white/85 shadow-[0_28px_90px_rgba(36,21,47,0.16)] backdrop-blur lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="p-6 sm:p-8 lg:p-10">
        <a href="/" class="inline-flex items-center gap-3" aria-label="Retour à l'accueil VitiLink">
          <img src="/logo/icon_vitilink.png" alt="" class="h-10 w-10 rounded-xl object-cover shadow-sm" />
          <span class="text-base font-semibold tracking-tight text-[#24152f]">VitiLink</span>
        </a>

        <div class="mt-12 max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">
            {isNotFound ? '404 not found' : `Erreur ${status}`}
          </p>
          <h1 class="mt-4 text-4xl font-semibold tracking-tight text-[#24152f] sm:text-5xl">{title}</h1>
          <p class="mt-4 text-base leading-8 text-zinc-600">{text}</p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/dashboard" class="btn-primary">Retour au dashboard</a>
            <a href="/" class="btn-secondary">Accueil VitiLink</a>
          </div>
        </div>
      </div>

      <aside class="relative hidden min-h-[420px] overflow-hidden bg-[#181121] text-white lg:block">
        <img src="/assets/images/image-recolte.jpeg" alt="" class="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,17,33,0.15)_0%,rgba(24,17,33,0.92)_100%)]"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6">
          <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-sm font-semibold">Reprendre le fil</div>
            <p class="mt-2 text-sm leading-6 text-white/65">
              Revenez à votre espace pour retrouver vos annonces, messages et documents.
            </p>
          </div>
        </div>
      </aside>
    </section>
  </main>
</div>
