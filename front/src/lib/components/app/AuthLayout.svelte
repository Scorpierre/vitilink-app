<script lang="ts">
  import PageTransition from '$lib/components/app/PageTransition.svelte';

  const benefits = [
    'Annonces raisin, moût et jus structurées',
    'Mise en relation directe entre professionnels',
    'Documents et échanges regroupés au même endroit',
  ];
</script>

<div class="min-h-screen bg-[#fbfaf8] lg:h-screen lg:overflow-hidden">
  <div class="grid min-h-screen lg:h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)]">
    <section class="relative isolate flex min-h-[420px] flex-col overflow-hidden bg-[#181121] px-5 py-5 text-white sm:px-8 lg:h-screen lg:px-10 lg:py-8">
      <img
        src="/assets/images/header.jpg"
        alt=""
        class="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-[#181121]/95 via-[#241435]/84 to-[#2f1743]/55"></div>
      <div class="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#181121] to-transparent"></div>

      <div class="flex items-center justify-between gap-4">
        <a href="/" class="flex items-center gap-3">
          <img src="/logo/icon_vitilink.png" alt="VitiLink" class="h-10 w-10 rounded-lg object-cover" />
          <div>
            <div class="text-base font-semibold tracking-tight">VitiLink</div>
            <div class="text-xs text-white/60">Marketplace B2B viticole</div>
          </div>
        </a>
        <a href="/" class="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white">
          Accueil
        </a>
      </div>

      <div class="flex flex-1 items-center py-8 lg:py-6">
        <div class="grid w-full gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-center">
          <div class="max-w-xl">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-medium text-white/78 backdrop-blur">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              Accès professionnel
            </div>

            <h1 class="mt-5 max-w-lg text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl">
              Publier, comparer, contacter. Sans perdre le fil.
            </h1>
            <p class="mt-5 max-w-lg text-sm leading-7 text-white/74 sm:text-base">
              VitiLink aide les viticulteurs, coopératives et négociants à gérer leurs offres B2B avec une interface claire : infos clés, contacts et documents au même endroit.
            </p>

            <div class="mt-7 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {#each benefits as benefit}
                <div class="rounded-lg border border-white/14 bg-white/10 p-3 backdrop-blur">
                  <div class="mb-3 h-1 w-8 rounded-full bg-violet-300"></div>
                  <p class="text-xs leading-5 text-white/78">{benefit}</p>
                </div>
              {/each}
            </div>
          </div>

          <div class="hidden xl:block">
            <div class="rounded-lg border border-white/16 bg-white/12 p-3 shadow-2xl shadow-black/25 backdrop-blur">
              <div class="overflow-hidden rounded-md bg-white text-[#24152f]">
                <img
                  src="/assets/images/image-recolte.jpeg"
                  alt=""
                  class="h-32 w-full object-cover"
                />
                <div class="p-4">
                  <div class="flex items-center justify-between gap-3">
                    <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Disponible</span>
                    <span class="text-xs font-medium text-zinc-500">4.5 tonnes</span>
                  </div>
                  <div class="mt-4 text-xs text-zinc-500">Raisin • AOC Champagne</div>
                  <div class="mt-1 text-lg font-semibold">Chardonnay Côte de Sézanne</div>
                  <div class="mt-3 flex items-end justify-between">
                    <span class="text-xl font-semibold text-violet-700">5.95 €/kg</span>
                    <span class="text-xs text-zinc-500">Sézanne</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3 text-xs text-white/72">
                <div class="rounded-md bg-white/10 p-3">Contact direct</div>
                <div class="rounded-md bg-white/10 p-3">Docs centralisés</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:bg-white">
      <div class="w-full max-w-[430px]">
        <div class="rounded-lg border border-[#e8e0ed] bg-white p-5 shadow-[0_18px_55px_rgba(31,13,54,0.10)] sm:p-6">
          <PageTransition>
            <slot />
          </PageTransition>
        </div>
      </div>
    </section>
  </div>
</div>
