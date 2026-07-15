<script lang="ts">
  const brand = 'VitiLink';
  const year = new Date().getFullYear();

  const navLinks = [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Annonces', href: '/dashboard/marche' },
    { label: 'Messages', href: '/dashboard/conversations' },
    { label: 'Mes annonces', href: '/dashboard/mes-annonces' },
    { label: 'Mentions légales', href: '/legal' },
    { label: 'CGU', href: '/cgu' },
    { label: 'CGV', href: '/cgv' },
  ];
</script>

<footer class="border-t border-violet-200/10 bg-[#181121] text-white">
  <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
    <div class="grid gap-10 md:grid-cols-12">
      <div class="md:col-span-5">
        <div class="flex items-center gap-3">
          <img src="/logo/icon_vitilink.png" alt="" class="h-9 w-9 rounded-lg object-cover" />
          <div>
            <div class="text-lg font-semibold tracking-tight">{brand}</div>
            <div class="text-xs font-medium text-white/50">Marketplace B2B viticole</div>
          </div>
        </div>

        <p class="mt-4 max-w-md text-sm leading-7 text-white/70">
          Une plateforme pour connecter producteurs, négociants et acheteurs autour du raisin,
          du jus de raisin et du moût avec une expérience claire, rapide et professionnelle.
        </p>

        <a
          href="/dashboard/mes-annonces/nouveau"
          class="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#24152f] transition hover:-translate-y-0.5 hover:bg-violet-50"
        >
          Déposer une annonce
        </a>
      </div>

      <div class="md:col-span-3 md:col-start-7">
        <h2 class="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Navigation</h2>
        <nav class="mt-4 grid gap-3">
          {#each navLinks as link}
            <a href={link.href} class="text-sm text-white/70 transition hover:text-white">
              {link.label}
            </a>
          {/each}
        </nav>
      </div>

      <div class="md:col-span-3">
        <h2 class="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Contact</h2>
        <div class="mt-4 grid gap-3">
          <a href="mailto:contact@vitilink.app" class="text-sm text-white/70 transition hover:text-white">
            contact@vitilink.app
          </a>
          <a
            href="https://www.linkedin.com/company/vitilinkfrance"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5H4.5V23.5H.5zM8.5 8.5H12.3V10.6H12.35C12.88 9.6 14.2 8.5 16.2 8.5C20.2 8.5 21 11.1 21 14.6V23.5H17V15.6C17 13.7 17 11.2 14.5 11.2C12 11.2 11.6 13.2 11.6 15.5V23.5H7.6V8.5H8.5z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </div>

    <div class="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
      <p>© {year} {brand}. Tous droits réservés.</p>
      <p>Espace professionnel pour échanges B2B viticoles.</p>
    </div>
  </div>
</footer>
