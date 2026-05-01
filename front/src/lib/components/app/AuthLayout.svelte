<div class="min-h-screen flex bg-[rgb(var(--bg))]">

  <!-- LEFT -->
  <div
    class="hidden lg:flex lg:w-[48%] relative flex-col justify-between overflow-hidden text-white"
    style="background:
      radial-gradient(circle at top left, rgba(167,139,250,0.20), transparent 30%),
      radial-gradient(circle at bottom right, rgba(124,58,237,0.30), transparent 34%),
      linear-gradient(160deg, #22142f 0%, #2d1b3d 52%, #4b2673 100%);"
  >
    <div
      class="absolute inset-0 opacity-[0.06]"
      style="background-image: radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 30px 30px;"
    ></div>
    <div class="absolute top-20 left-16 w-72 h-72 rounded-full border border-white/10"></div>
    <div class="absolute bottom-16 right-10 w-96 h-96 rounded-full border border-white/5"></div>

    <div class="relative z-10 px-14 pt-12">
      <a href="/" class="inline-flex items-center gap-3">
        <img
          src="/logo/icon_vitilink.png"
          alt="VitiLink"
          class="w-11 h-11 rounded-2xl object-cover border border-white/20 shadow-lg"
        />
        <div>
          <div class="text-lg font-semibold tracking-tight">VitiLink</div>
          <div class="text-xs text-white/55">Marketplace viticole B2B</div>
        </div>
      </a>
    </div>

    <div class="relative z-10 px-14 pb-20">
      <div class="max-w-md">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
          Plateforme pro • Raisin • Jus • Moût
        </div>

        <h1 class="text-4xl font-semibold leading-[1.1] tracking-tight">
          La place de marché viticole pensée pour des échanges
          <span class="text-violet-300">simples, rapides et fiables</span>.
        </h1>

        <p class="mt-5 text-[15px] leading-7 text-white/68">
          Publiez vos offres, trouvez les bons acheteurs, centralisez les échanges et valorisez
          vos produits avec une expérience premium adaptée au secteur viticole.
        </p>

        <div class="mt-10 grid gap-4">
          {#each [
            'Annonces détaillées et structurées',
            'Messagerie professionnelle intégrée',
            'Profil entreprise clair et rassurant'
          ] as item}
            <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <svg class="w-4 h-4 text-violet-300" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-sm text-white/75">{item}</span>
            </div>
          {/each}
        </div>

        <div class="mt-12 rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
          <p class="text-sm italic text-white/70">“Le vin est la poésie de la terre.”</p>
          <p class="text-xs text-white/40 mt-2">— Mario Soldati</p>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT -->
  <div class="flex-1 flex flex-col bg-[linear-gradient(180deg,#fcfbff_0%,#ffffff_100%)]">
    <div class="flex lg:hidden items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))] bg-white/80 backdrop-blur-md">
      <a href="/" class="flex items-center gap-2.5">
        <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-8 h-8 rounded-xl object-cover" />
        <span class="font-semibold text-zinc-950 text-base tracking-tight">VitiLink</span>
      </a>
      <a href="/" class="text-xs text-zinc-500 hover:text-zinc-800 transition">← Accueil</a>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(31,13,54,0.08)]">
          <slot />
        </div>

        <div class="hidden lg:block mt-6 text-center">
          <a href="/" class="text-xs text-zinc-500 hover:text-zinc-800 transition">← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  </div>
</div>