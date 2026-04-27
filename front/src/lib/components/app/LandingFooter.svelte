<footer class="relative overflow-hidden" style="background-color: #13151f;">
  <div class="pointer-events-none absolute right-0 bottom-0 h-64 w-96 rounded-full bg-brand-800/20 blur-3xl"></div>

  <div class="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
    <div class="h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent mb-10"></div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-12 gap-10">

      <!-- Brand + CTA -->
      <div class="sm:col-span-2 lg:col-span-4">
        <div class="flex items-center gap-2.5 mb-4">
          <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-8 h-8 rounded-xl object-cover" />
          <span class="font-semibold text-white text-base tracking-tight">VitiLink</span>
        </div>
        <p class="text-sm text-white/45 leading-relaxed mb-6">
          Marketplace B2B viticole — projet EIP Epitech 2027. Connecter vignerons, coopératives et négociants sur une plateforme unique.
        </p>
        <a
          href="/signUp"
          class="inline-flex items-center gap-2 rounded-2xl bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-500 hover:-translate-y-0.5 transition shadow-sm shadow-brand-900/30"
        >
          Devenir testeur MVP
        </a>
        <p class="mt-3 text-xs text-white/25">Accès progressif · Pas de spam</p>
      </div>

      <!-- Navigation -->
      <div class="lg:col-span-3 lg:col-start-6">
        <div class="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Navigation</div>
        <ul class="space-y-2.5">
          {#each [['MVP', '#mvp'], ['Contexte', '#contexte'], ['Problème', '#probleme'], ['Solution', '#solution']] as [label, href]}
            <li>
              <a {href} class="text-sm text-white/50 hover:text-white transition">{label}</a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Contact + académique -->
      <div class="lg:col-span-3">
        <div class="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4">Contact</div>
        <a href="mailto:contact@vitilink.app" class="text-sm text-white/50 hover:text-white transition block mb-3">
          contact@vitilink.app
        </a>
        <a href="https://www.linkedin.com/company/vitilinkfrance" target="_blank" rel="noopener noreferrer" class="mt-0 mb-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5H4.5V23.5H.5zM8.5 8.5H12.3V10.6H12.35C12.88 9.6 14.2 8.5 16.2 8.5C20.2 8.5 21 11.1 21 14.6V23.5H17V15.6C17 13.7 17 11.2 14.5 11.2C12 11.2 11.6 13.2 11.6 15.5V23.5H7.6V8.5H8.5z"/></svg>
          LinkedIn
        </a>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="text-xs text-white/40 space-y-1">
            <div>EPITECH</div>
            <div>EIP — Promo 2027</div>
            <div>Track Entrepreneuriat</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-12 pt-6 border-t border-white/10 flex flex-col items-center justify-center gap-3 text-center">
      <p class="text-xs text-white/25">
        © 2026 VitiLink. Projet académique réalisé dans le cadre de l'EIP — Epitech 2027
      </p>
      <div class="flex items-center gap-1.5 text-xs text-white/25 justify-center">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Beta active
      </div>
    </div>
  </div>
</footer>
