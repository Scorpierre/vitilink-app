<script lang="ts">
  const problems = [
    {
      number: '01',
      title: 'Comparer les offres prend trop de temps',
      body: 'Type de produit, volume, localisation, disponibilité et conditions arrivent rarement au même format.',
    },
    {
      number: '02',
      title: 'Les échanges se dispersent',
      body: 'Appels, emails et messages se croisent sans historique clair. Les décisions ralentissent.',
    },
    {
      number: '03',
      title: 'Les documents restent difficiles à retrouver',
      body: 'Analyses, justificatifs et contrats circulent sans espace commun, avec plus de charge administrative.',
    },
  ];

  const solution = [
    {
      label: 'Lisibilité',
      title: 'Des annonces structurées',
      body: 'Raisin, moût et jus avec les informations essentielles visibles immédiatement.',
    },
    {
      label: 'Fluidité',
      title: 'Une mise en relation directe',
      body: 'Contacter un professionnel depuis une offre et garder un fil clair des échanges.',
    },
    {
      label: 'Fiabilité',
      title: 'Des documents centralisés',
      body: 'Regrouper contrats, analyses et pièces utiles pour limiter les erreurs.',
    },
  ];

  const mvpSteps = [
    ['Publier', 'Créer une offre avec produit, volume, localisation et disponibilité.'],
    ['Comparer', 'Lire les informations clés sans devoir appeler pour comprendre.'],
    ['Contacter', 'Déclencher une mise en relation depuis l’annonce.'],
    ['Centraliser', 'Conserver les documents utiles au même endroit.'],
  ];

  const audiences = ['Viticulteurs', 'Coopératives', 'Négociants', 'Cuveries'];

  function reveal(node: HTMLElement) {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.unobserve(node);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }
</script>

<svelte:head>
  <title>VitiLink - Marketplace B2B viticole</title>
  <meta
    name="description"
    content="VitiLink simplifie les échanges B2B viticoles : annonces structurées, mise en relation directe et documents centralisés."
  />
  <link rel="preload" as="image" href="/assets/images/header.jpg" />
  <link rel="preload" as="video" href="/assets/videos/header.mp4" type="video/mp4" />
</svelte:head>

<main class="bg-[#fbfaf8] text-[#24152f]">
  <section class="relative isolate min-h-[110svh] overflow-hidden pt-[7.5rem] pb-28 lg:pt-36">
    <img
      src="/assets/images/header.jpg"
      alt=""
      class="absolute inset-x-0 -top-10 -bottom-24 -z-30 h-[calc(100%+8.5rem)] w-full translate-y-5 scale-[1.03] object-cover object-[center_58%]"
      aria-hidden="true"
    />
    <video
      class="absolute inset-x-0 -top-10 -bottom-24 -z-20 h-[calc(100%+8.5rem)] w-full translate-y-5 scale-[1.03] object-cover object-[center_58%]"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/assets/images/header.jpg"
      aria-hidden="true"
    >
      <source src="/assets/videos/header.mp4" type="video/mp4" />
    </video>
    <div
      class="absolute inset-x-0 -bottom-56 -z-10 h-[34rem]"
      style="background: linear-gradient(to top, #fbfaf8 0%, rgba(248,242,234,0.92) 24%, rgba(251,250,248,0.48) 46%, rgba(251,250,248,0.14) 70%, transparent 100%);"
    ></div>
    <div
      class="absolute inset-x-0 -bottom-80 -z-10 h-96"
      style="background: linear-gradient(to top, #fbfaf8 0%, rgba(251,250,248,0.88) 42%, transparent 100%);"
    ></div>

    <div class="mx-auto flex min-h-[calc(110svh-13rem)] max-w-6xl items-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl reveal reveal-up" use:reveal>
        <div class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          Beta terrain
          <span class="text-white/45">/</span>
          EIP Epitech 2027
        </div>

        <p class="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-violet-100">VitiLink</p>
        <h1 class="mt-3 max-w-2xl text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
          Du vignoble au clic
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
          Une marketplace B2B pour vendre et acheter du raisin, du moût et du jus avec des offres claires, des échanges directs et des documents centralisés.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <a
            href="#mvp"
            class="inline-flex items-center justify-center rounded-lg bg-[#5b2df2] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,45,242,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4b22ce]"
          >
            Découvrir le MVP
          </a>
          <a
            href="/signUp"
            class="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            Devenir testeur
          </a>
        </div>

        <div class="mt-12 grid max-w-2xl grid-cols-2 gap-4 border-t border-white/20 pt-6 text-white sm:grid-cols-4">
          {#each audiences as audience}
            <div>
              <div class="text-sm font-semibold">{audience}</div>
              <div class="mt-1 h-px w-10 bg-violet-300/80"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section id="contexte" class="bg-gradient-to-b from-[#fbfaf8] via-[#f8f2ea] to-[#fbfaf8]">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
      <div class="lg:col-span-5 reveal reveal-left" use:reveal>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">Contexte</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#24152f] sm:text-4xl">
          Un projet EIP pensé comme un vrai produit.
        </h2>
      </div>
      <div class="space-y-5 text-base leading-8 text-zinc-700 lg:col-span-7 reveal reveal-right" use:reveal>
        <p>
          VitiLink part d'un constat simple : les professionnels de la filière viticole échangent encore beaucoup par canaux fragmentés. La première version se concentre donc sur ce qui aide vraiment le terrain.
        </p>
        <p>
          L'objectif du MVP est de rendre chaque étape plus lisible : publier une offre, comparer rapidement, contacter le bon interlocuteur et retrouver les documents utiles.
        </p>
      </div>
    </div>
  </section>

  <section id="probleme" class="bg-gradient-to-b from-[#fbfaf8] via-white to-white py-20 lg:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-5 reveal reveal-left" use:reveal>
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700">Problème</p>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#24152f] sm:text-4xl">
            Le marché B2B viticole manque d'un espace commun.
          </h2>
        </div>
        <p class="text-base leading-8 text-zinc-700 lg:col-span-6 lg:col-start-7 reveal reveal-right" use:reveal>
          Quand les informations sont éclatées, la comparaison devient lente et la confiance dépend de multiples allers-retours. VitiLink simplifie sans changer les habitudes métier.
        </p>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-3">
        {#each problems as problem, index}
          <article
            class="reveal reveal-up rounded-lg border border-violet-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(48,22,75,0.10)]"
            use:reveal
            style={`--delay: ${index * 90}ms`}
          >
            <div class="text-sm font-semibold text-violet-700">{problem.number}</div>
            <h3 class="mt-5 text-lg font-semibold text-[#24152f]">{problem.title}</h3>
            <p class="mt-3 text-sm leading-7 text-zinc-700">{problem.body}</p>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section id="solution" class="overflow-hidden bg-[#f3eef8] py-20 lg:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-5 reveal reveal-left" use:reveal>
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">Solution</p>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#24152f] sm:text-4xl">
            Une interface claire pour structurer l'échange.
          </h2>
          <p class="mt-5 text-base leading-8 text-zinc-700">
            Le MVP rassemble les offres, les contacts et les documents dans un parcours volontairement simple, testable rapidement avec des pilotes terrain.
          </p>

          <div class="mt-8 space-y-4">
            {#each solution as item, index}
              <article
                class="reveal reveal-left rounded-lg border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(48,22,75,0.10)]"
                use:reveal
                style={`--delay: ${index * 90}ms`}
              >
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">{item.label}</div>
                <h3 class="mt-2 text-base font-semibold text-[#24152f]">{item.title}</h3>
                <p class="mt-2 text-sm leading-7 text-zinc-700">{item.body}</p>
              </article>
            {/each}
          </div>
        </div>

        <div class="lg:col-span-7 reveal reveal-right" use:reveal>
          <div class="grid gap-4 sm:grid-cols-5">
            <figure class="overflow-hidden rounded-lg border border-white bg-white shadow-lg sm:col-span-3">
              <img
                src="/assets/images/mvp-pres.png"
                alt="Aperçu de l'interface VitiLink"
                class="h-full max-h-[680px] w-full object-cover object-top"
                loading="eager"
              />
            </figure>
            <figure class="overflow-hidden rounded-lg border border-white bg-white shadow-lg sm:col-span-2">
              <img
                src="/assets/images/image-recolte.jpeg"
                alt="Récolte de raisin dans un contexte viticole"
                class="h-full min-h-72 w-full object-cover"
                loading="eager"
              />
            </figure>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="mvp" class="bg-white py-20 lg:py-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center reveal reveal-up" use:reveal>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">MVP</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#24152f] sm:text-4xl">
          Une première version courte, utile et testable.
        </h2>
        <p class="mt-5 text-base leading-8 text-zinc-700">
          Pas de complexité inutile : VitiLink commence par les quatre actions qui rendent l'échange B2B plus rapide.
        </p>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-4">
        {#each mvpSteps as step, index}
          <article
            class="reveal reveal-up rounded-lg bg-[#fbfaf8] p-6 ring-1 ring-violet-100 transition hover:-translate-y-1 hover:bg-violet-50/70"
            use:reveal
            style={`--delay: ${index * 85}ms`}
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5b2df2] text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 class="mt-5 text-lg font-semibold text-[#24152f]">{step[0]}</h3>
            <p class="mt-3 text-sm leading-7 text-zinc-700">{step[1]}</p>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="relative isolate overflow-hidden py-20 text-white lg:py-24">
    <img
      src="/assets/images/header.jpg"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full object-cover"
      loading="lazy"
    />
    <div class="absolute inset-0 -z-10 bg-[#24152f]/88"></div>
    <div class="absolute inset-y-0 left-0 -z-10 w-[58%] bg-[radial-gradient(circle_at_18%_24%,rgba(139,92,246,0.28),transparent_34%)]"></div>

    <div class="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
      <div class="lg:col-span-7 reveal reveal-left" use:reveal>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200">Beta terrain</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Rejoindre les premiers testeurs VitiLink.
        </h2>
        <p class="mt-5 max-w-2xl text-base leading-8 text-white/80">
          L'accès s'ouvre progressivement aux viticulteurs, coopératives et négociants pour tester le MVP sur des cas réels et prioriser la roadmap.
        </p>
      </div>

      <div class="lg:col-span-4 lg:col-start-9 reveal reveal-right" use:reveal>
        <div class="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur">
          <div class="text-sm font-semibold text-white">Accès pilote</div>
          <p class="mt-3 text-sm leading-7 text-white/70">
            Une demande, un échange terrain, puis un accès progressif à la beta.
          </p>
          <a
            href="/signUp"
            class="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#24152f] transition hover:-translate-y-0.5 hover:bg-violet-50"
          >
            Demander un accès
          </a>
          <a
            href="mailto:contact@vitilink.app"
            class="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Contacter l'équipe
          </a>
        </div>
      </div>
    </div>
  </section>
</main>

<style>
  .reveal {
    opacity: 0;
    transition:
      opacity 720ms ease,
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--delay, 0ms);
    will-change: opacity, transform;
  }

  .reveal-up {
    transform: translateY(28px);
  }

  .reveal-left {
    transform: translateX(-42px);
  }

  .reveal-right {
    transform: translateX(42px);
  }

  :global(.reveal.is-visible) {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  @media (max-width: 767px) {
    .reveal-left,
    .reveal-right {
      transform: translateY(28px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
