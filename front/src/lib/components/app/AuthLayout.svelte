<div class="min-h-screen flex">

  <!-- LEFT: Brand panel (desktop) -->
  <div class="hidden lg:flex lg:w-[44%] relative flex-col items-center justify-center overflow-hidden" style="background-color: #1b1d2d;">
    <div class="pointer-events-none absolute -left-20 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-900/60 blur-3xl"></div>
    <div class="pointer-events-none absolute right-0 bottom-1/4 h-[24rem] w-[24rem] rounded-full bg-violet-900/50 blur-3xl"></div>
    <div class="absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 28px 28px;"></div>
    <div class="absolute top-1/4 -left-28 w-96 h-96 rounded-full border border-white/[0.05]"></div>
    <div class="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full border border-white/[0.04]"></div>

    <div class="relative z-10 px-14 max-w-sm text-center">
      <a href="/" class="flex items-center justify-center gap-3 mb-12">
        <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-11 h-11 rounded-2xl object-cover border border-white/20" />
        <span class="text-xl font-semibold text-white tracking-tight">VitiLink</span>
      </a>

      <div class="mx-auto mb-6 h-1 w-12 rounded-full bg-gradient-to-r from-violet-400 via-brand-500 to-violet-400"></div>

      <h2 class="text-3xl font-semibold text-white leading-tight">
        La marketplace B2B du monde viticole
      </h2>
      <p class="mt-4 text-sm text-white/50 leading-relaxed">
        Vignerons, négociants, coopératives — connectez‑vous avec les bons partenaires professionnels.
      </p>

      <ul class="mt-10 space-y-3 text-left">
        {#each ['Annonces structurées et lisibles', 'Mise en relation directe', 'Documents centralisés'] as item}
          <li class="flex items-center gap-3 text-sm text-white/55">
            <span class="h-5 w-5 shrink-0 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </span>
            {item}
          </li>
        {/each}
      </ul>

      <div class="mt-12 pt-8 border-t border-white/10 text-left">
        <div class="flex gap-3">
          <div class="shrink-0 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-brand-500 self-stretch"></div>
          <div>
            <p class="text-white/40 text-sm italic leading-relaxed">"Le vin est la poésie de la terre."</p>
            <p class="text-white/25 text-xs mt-2">— Mario Soldati</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT: Form panel (white) -->
  <div class="flex-1 flex flex-col bg-white">

    <!-- Mobile header -->
    <div class="flex lg:hidden items-center justify-between px-5 py-4 border-b border-zinc-100">
      <a href="/" class="flex items-center gap-2.5">
        <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-7 h-7 rounded-lg object-cover" />
        <span class="font-semibold text-zinc-900 text-base tracking-tight">VitiLink</span>
      </a>
      <a href="/" class="text-xs text-zinc-400 hover:text-zinc-600 transition">← Accueil</a>
    </div>

    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <slot />
        <div class="hidden lg:block mt-6 text-center">
          <a href="/" class="text-xs text-zinc-400 hover:text-zinc-600 transition">← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  </div>
</div>
