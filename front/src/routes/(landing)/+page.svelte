<!-- ══════════════════════════════════════════════════════════════
     HERO
══════════════════════════════════════════════════════════════ -->
<section class="relative min-h-screen flex items-center overflow-hidden" style="background-color: #1b1d2d;">
  <div class="pointer-events-none absolute -left-40 top-20 h-[40rem] w-[40rem] rounded-full bg-brand-900/70 blur-3xl"></div>
  <div class="pointer-events-none absolute right-0 top-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-900/40 blur-3xl"></div>
  <div class="pointer-events-none absolute left-1/2 bottom-0 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-brand-800/30 blur-3xl"></div>
  <div class="absolute inset-0 opacity-[0.08]" style="background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 32px 32px;"></div>

  <div class="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
    <div class="max-w-3xl">

      <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur mb-6">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="font-semibold">Track Entrepreneurial · EIP</span>
        <span class="text-white/30">·</span>
        <span class="text-white/60">Beta en cours</span>
      </div>

      <p class="text-brand-300/80 text-sm font-semibold tracking-widest uppercase mb-3">VitiLink</p>

      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight">
        Du vignoble<br/>
        <span class="bg-gradient-to-r from-brand-400 via-violet-300 to-brand-300 bg-clip-text text-transparent">au clic.</span>
      </h1>

      <div class="mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-violet-400 via-brand-500 to-violet-400"></div>

      <p class="mt-6 text-lg sm:text-xl text-white/60 leading-relaxed max-w-xl">
        Marketplace B2B pour vendre et acheter du raisin, moût et jus — sans intermédiaire, sans friction.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href="#mvp"
          class="inline-flex items-center gap-2 rounded-2xl bg-brand-600 text-white px-6 py-3.5 text-sm font-semibold shadow-lg shadow-brand-900/40 hover:bg-brand-500 hover:-translate-y-0.5 transition"
        >
          Découvrir le MVP
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </a>
        <a
          href="/signUp"
          class="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 text-white px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/15 hover:-translate-y-0.5 transition"
        >
          Essayer le MVP
        </a>
      </div>

      <div class="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-8">
        {#each [['340+', 'Vignerons inscrits'], ['12', 'Régions couvertes'], ['Beta', 'Phase active'], ['2027', 'EIP Epitech']] as [val, label]}
          <div>
            <div class="text-xl font-semibold text-white">{val}</div>
            <div class="text-xs text-white/40 mt-0.5">{label}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

</section>


<!-- ══════════════════════════════════════════════════════════════
     CONTEXTE
══════════════════════════════════════════════════════════════ -->
<section id="contexte" class="relative py-24 bg-white overflow-hidden">
  <div class="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-brand-50 blur-3xl -z-10"></div>
  <div class="pointer-events-none absolute right-0 bottom-0 h-[24rem] w-[24rem] rounded-full bg-violet-100/60 blur-3xl -z-10"></div>

  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

    <div class="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></div>
    <div class="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200/60 mb-5">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      EIP · Track Entrepreneurial — Projet étudiant — Beta en cours
    </div>

    <div class="grid lg:grid-cols-12 gap-10 lg:gap-14">
      <div class="lg:col-span-7">
        <h2 class="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight leading-tight">
          C'est quoi VitiLink ?
        </h2>
        <p class="mt-4 text-base text-zinc-500 leading-relaxed">
          VitiLink est une marketplace B2B viticole qui connecte viticulteurs, coopératives et négociants sur une plateforme unique. Fini les échanges par email, les appels à répétition et les fichiers Excel perdus.
        </p>
        <p class="mt-3 text-base text-zinc-500 leading-relaxed">
          Le projet part d'un constat simple : le marché viticole B2B fonctionne encore sur des canaux fragmentés. VitiLink centralise la mise en relation et les documents au même endroit.
        </p>

        <div class="mt-8 grid sm:grid-cols-2 gap-4">
          <div class="rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-200/60">
            <div class="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Contexte</div>
            <p class="text-sm text-zinc-600 leading-relaxed">
              Projet EIP Epitech — on itère vite, on teste sur le terrain et on livre un MVP utile avant d'aller plus loin.
            </p>
          </div>
          <div class="rounded-2xl bg-violet-50 p-5 ring-1 ring-violet-200/70">
            <div class="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">But</div>
            <p class="text-sm text-zinc-600 leading-relaxed">
              Centraliser les annonces, fluidifier la mise en relation et réduire les allers-retours administratifs entre professionnels.
            </p>
          </div>
        </div>

        <ul class="mt-8 space-y-3">
          {#each [
            ['Annonces structurées', "Type, volume, localisation — lisibles en un coup d'œil"],
            ['Mise en relation directe', 'Contactez un vendeur depuis son offre, sans intermédiaire'],
            ['Documents centralisés', 'Contrats, analyses et pièces utiles au même endroit'],
            ['Roadmap terrain', 'Chaque itération est guidée par les retours des pilotes'],
          ] as [title, desc]}
            <li class="flex items-start gap-3">
              <span class="mt-1 h-5 w-5 shrink-0 rounded-full bg-brand-100 flex items-center justify-center ring-1 ring-brand-200/60">
                <svg class="w-3 h-3 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div>
                <span class="text-sm font-semibold text-zinc-800">{title}</span>
                <span class="text-sm text-zinc-500"> — {desc}</span>
              </div>
            </li>
          {/each}
        </ul>

        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#mvp" class="inline-flex items-center gap-2 rounded-2xl bg-brand-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-brand-800 hover:-translate-y-0.5 transition">
            Découvrir comment ça marche
          </a>
          <a href="#solution" class="inline-flex items-center gap-2 rounded-2xl border border-brand-200/70 bg-white text-brand-900 px-5 py-2.5 text-sm font-medium hover:bg-brand-50 transition">
            Voir la roadmap
          </a>
        </div>
      </div>

      <aside class="lg:col-span-5 space-y-4">
        <div class="rounded-3xl border border-brand-200/70 bg-white shadow-sm p-6 overflow-hidden relative">
          <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-50 blur-2xl"></div>
          <div class="relative z-10">
            <img src="/logo/logo_epitech-lille.jpeg" alt="Epitech" class="h-6 object-contain mb-4 opacity-70" />
            <div class="space-y-3">
              {#each [['École', 'Epitech Paris'], ['Projet', 'EIP — Entrepreneurial Individual Project'], ['Track', 'Entrepreneuriat'], ['Promo', '2027']] as [k, v]}
                <div class="flex items-center justify-between text-sm">
                  <span class="text-zinc-400">{k}</span>
                  <span class="font-medium text-zinc-800">{v}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-brand-200/70 bg-white shadow-sm p-6">
          <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ligne directrice</div>
          <ul class="space-y-2.5">
            {#each ["Tester vite, apprendre vite", "Simplifier l'échange B2B", 'Sécuriser les documents', 'Itérer avec les pilotes'] as item}
              <li class="flex items-center gap-2.5 text-sm text-zinc-600">
                <span class="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0"></span>
                {item}
              </li>
            {/each}
          </ul>
        </div>

        <div class="rounded-3xl border border-violet-200/70 bg-violet-50 p-5 ring-1 ring-violet-200/60">
          <div class="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">Ce que vous allez voir</div>
          <p class="text-sm text-zinc-600">Le MVP, la roadmap, et comment accéder à la beta en priorité.</p>
          <a href="#mvp" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-900 transition">
            Continuer la lecture →
          </a>
        </div>
      </aside>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════════════════
     PROBLÈME
══════════════════════════════════════════════════════════════ -->
<section id="probleme" class="relative py-24 overflow-hidden" style="background-color: #f8f7f5;">
  <div class="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-100/50 blur-3xl -z-10"></div>

  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

    <div class="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></div>
    <div class="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200/60 mb-5">
      <span class="h-2 w-2 rounded-full bg-rose-500"></span>
      Le problème du marché viticole
    </div>

    <div class="max-w-2xl mb-12">
      <h2 class="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight leading-tight">
        Un marché B2B encore trop dispersé.
      </h2>
      <p class="mt-4 text-base text-zinc-500 leading-relaxed">
        Les échanges entre viticulteurs, coopératives et négociants restent fragmentés : emails, appels, fichiers partagés en désordre. Résultat : des décisions lentes, des opportunités manquées.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-5">
      {#each [
        { num: '01', title: 'Offres difficiles à comparer', body: 'Les informations essentielles — type, volume, localisation, timing — ne sont jamais au même endroit ni au même format.', consequence: 'Prise de décision lente' },
        { num: '02', title: 'Échanges fragmentés', body: 'Appels, emails, SMS et messages se multiplient sans historique clair. La friction augmente, la confiance diminue.', consequence: 'Plus de friction, moins de confiance' },
        { num: '03', title: 'Documents non centralisés', body: "Contrats, analyses, justificatifs — sans endroit unique pour les retrouver, l'administratif ralentit tout.", consequence: 'Erreurs, charge admin, validation retardée' },
      ] as pb}
        <div class="relative bg-white rounded-3xl border border-zinc-200/70 p-6 shadow-sm hover:-translate-y-1 transition-all duration-700 overflow-hidden flex flex-col gap-5">
          <div class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-zinc-50 blur-2xl"></div>
          <span class="relative z-10 text-4xl font-semibold text-zinc-100 tabular-nums leading-none">{pb.num}</span>
          <div class="relative z-10">
            <h3 class="text-base font-semibold text-zinc-900 mb-2">{pb.title}</h3>
            <p class="text-sm text-zinc-500 leading-relaxed">{pb.body}</p>
          </div>
          <div class="relative z-10 mt-auto pt-4 border-t border-zinc-100 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-rose-400 shrink-0"></span>
            <span class="text-xs font-medium text-zinc-500">{pb.consequence}</span>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-10 rounded-3xl border border-brand-200/70 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-sm">
      <div>
        <div class="text-sm font-semibold text-zinc-900 mb-1">Et maintenant ?</div>
        <p class="text-sm text-zinc-500 max-w-lg">
          L'objectif du MVP : apporter de la clarté et de la rapidité dès la première version. On avance par itérations, avec des pilotes terrain qui guident chaque ajout.
        </p>
      </div>
      <a href="#solution" class="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-brand-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-brand-800 hover:-translate-y-0.5 transition">
        Voir la solution →
      </a>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════════════════
     SOLUTION
══════════════════════════════════════════════════════════════ -->
<section id="solution" class="relative py-24 bg-white overflow-hidden">
  <div class="pointer-events-none absolute right-0 top-10 h-[32rem] w-[32rem] rounded-full bg-violet-100/70 blur-3xl -z-10"></div>
  <div class="pointer-events-none absolute -left-40 bottom-0 h-[24rem] w-[24rem] rounded-full bg-brand-50 blur-3xl -z-10"></div>

  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

    <div class="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></div>
    <div class="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200/60 mb-5">
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      Notre solution
    </div>

    <div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      <div class="lg:col-span-5">
        <h2 class="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight leading-tight">
          VitiLink remet de la clarté dans les échanges B2B viticoles.
        </h2>
        <p class="mt-4 text-base text-zinc-500 leading-relaxed">
          Un espace unique pour publier, comparer, contacter et centraliser. Chaque professionnel retrouve ce dont il a besoin sans avoir à chercher ailleurs.
        </p>

        <div class="mt-8 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-200/60">
          <div class="text-sm font-semibold text-zinc-800 mb-2">Pourquoi ça marche — MVP d'abord</div>
          <p class="text-sm text-zinc-500 leading-relaxed mb-4">
            On commence simple : publication, comparaison, contact, documents. Puis on améliore avec les retours des pilotes.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200/60">
              <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              MVP — Clair & testable
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200/60">
              <span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
              Roadmap — Guidée par le terrain
            </span>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#mvp" class="inline-flex items-center gap-2 rounded-2xl bg-brand-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-brand-800 hover:-translate-y-0.5 transition">
            Voir le MVP
          </a>
          <a href="/signUp" class="inline-flex items-center gap-2 rounded-2xl border border-brand-200/70 bg-white text-brand-900 px-5 py-2.5 text-sm font-medium hover:bg-brand-50 transition">
            Voir la roadmap
          </a>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-4">
        {#each [
          { tag: 'Lisibilité', tagColor: 'bg-brand-50 text-brand-700 ring-brand-200/60', title: 'Annonces structurées', body: "Toutes les informations essentielles sont visibles immédiatement : type de produit, volume, localisation, timing et conditions. Pas besoin d'appeler pour comprendre l'offre.", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>` },
          { tag: 'Fluidité', tagColor: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60', title: 'Mise en relation directe', body: 'Prenez contact directement depuis une offre. Historique clair des échanges, pas de messages perdus, relation directe avec le producteur.', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>` },
          { tag: 'Fiabilité', tagColor: 'bg-violet-50 text-violet-700 ring-violet-200/60', title: 'Documents au même endroit', body: 'Contrats, analyses et pièces utiles sont centralisés sur la plateforme. Fini les emails avec des pièces jointes dispersées.', icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>` },
        ] as feat}
          <div class="relative bg-white rounded-3xl border border-brand-200/70 p-6 shadow-sm hover:-translate-y-0.5 transition-all duration-500 overflow-hidden flex gap-5">
            <div class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-50 blur-2xl"></div>
            <div class="relative z-10 shrink-0 w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-200/60 mt-0.5">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                {@html feat.icon}
              </svg>
            </div>
            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-1.5">
                <h3 class="text-sm font-semibold text-zinc-900">{feat.title}</h3>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 {feat.tagColor}">{feat.tag}</span>
              </div>
              <p class="text-sm text-zinc-500 leading-relaxed">{feat.body}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════════════════════════════════════════════
     MVP
══════════════════════════════════════════════════════════════ -->
<section id="mvp" class="relative py-24 overflow-hidden" style="background-color: #1b1d2d;">
  <div class="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-brand-900/60 blur-3xl"></div>
  <div class="pointer-events-none absolute right-0 bottom-0 h-[24rem] w-[24rem] rounded-full bg-violet-900/40 blur-3xl"></div>
  <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 28px 28px;"></div>

  <div class="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

    <div class="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 via-brand-500 to-violet-400"></div>
    <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-5">
      <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
      Le MVP
    </div>

    <div class="grid lg:grid-cols-12 gap-10 lg:gap-14">
      <div class="lg:col-span-6">
        <h2 class="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
          Une première version simple, utile et testable.
        </h2>
        <p class="mt-4 text-base text-white/55 leading-relaxed">
          Pas de fonctionnalités superflues. Le MVP se concentre sur l'essentiel : publier, comparer, contacter et centraliser.
        </p>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {#each [
            ['Publier une offre', 'Raisin, moût, jus — avec toutes les infos structurées'],
            ['Comparer rapidement', 'Les infos clés sont visibles immédiatement, sans appel'],
            ["Contact direct", "Prenez contact directement depuis l'annonce"],
            ['Documents centralisés', 'Contrats et analyses accessibles au même endroit'],
          ] as [title, desc]}
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:-translate-y-0.5 transition-all duration-500">
              <div class="text-sm font-semibold text-white mb-1">{title}</div>
              <p class="text-xs text-white/45 leading-relaxed">{desc}</p>
            </div>
          {/each}
        </div>
      </div>

      <div class="lg:col-span-6">
        <div class="rounded-3xl border border-white/15 bg-white/5 backdrop-blur p-8 h-full flex flex-col justify-between gap-8">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 mb-5">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Accès limité — Phase beta
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Demander un accès au MVP</h3>
            <p class="text-sm text-white/55 leading-relaxed">
              L'accès s'ouvre progressivement. On teste avec des viticulteurs, coopératives et négociants sélectionnés pour garantir une expérience terrain utile dès le départ.
            </p>
            <p class="mt-3 text-xs text-white/35">
              Une demande = un accès pilote + un échange terrain avec l'équipe.
            </p>
          </div>
          <div class="space-y-3">
            <a href="/signUp" class="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-600 text-white px-6 py-3.5 text-sm font-semibold shadow-lg shadow-brand-900/40 hover:bg-brand-500 hover:-translate-y-0.5 transition">
              Essayer le MVP
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </a>
            <a href="#solution" class="flex items-center justify-center gap-2 w-full rounded-2xl border border-white/15 bg-transparent text-white/70 px-6 py-3 text-sm font-medium hover:bg-white/10 hover:text-white transition">
              Voir la roadmap
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

</section>


<!-- ══════════════════════════════════════════════════════════════
     CTA FINAL
══════════════════════════════════════════════════════════════ -->
<section class="relative py-20 bg-white overflow-hidden">
  <div class="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-brand-50 blur-3xl -z-10"></div>

  <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
    <p class="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-4">Rejoindre la beta</p>
    <h2 class="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight leading-tight max-w-xl mx-auto">
      Prêt à simplifier vos échanges viticoles ?
    </h2>
    <p class="mt-4 text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
      Accès limité, test terrain. Rejoignez les premiers vignerons, coopératives et négociants sur la plateforme.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <a href="/signUp" class="inline-flex items-center gap-2 rounded-2xl bg-brand-600 text-white px-7 py-3.5 text-sm font-semibold shadow-lg shadow-brand-900/20 hover:bg-brand-500 hover:-translate-y-0.5 transition">
        Demander un accès
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </a>
      <a href="mailto:contact@vitilink.app" class="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white text-zinc-700 px-7 py-3.5 text-sm font-medium hover:bg-zinc-50 transition">
        Nous contacter
      </a>
    </div>
    <p class="mt-4 text-xs text-zinc-400">Accès progressif · Pas de spam · Projet EIP Epitech 2027</p>
  </div>

</section>
