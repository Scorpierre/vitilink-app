<script lang="ts">
  const brand = 'VitiLink';
  const year = new Date().getFullYear();

  const navLinks = [
    { label: 'Tableau de bord', href: '/home' },
    { label: 'Annonces', href: '/home/marche' },
    { label: 'Messages', href: '/home/conversations' },
    { label: 'Mes annonces', href: '/home/mes-annonces' },
    { label: 'Mentions légales', href: '/legal' },
    { label: 'CGU', href: '/cgu' }
  ];
</script>

<footer class="relative overflow-hidden border-t border-[rgb(var(--border))] bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]">
  <div class="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-[rgba(139,92,246,0.08)] blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-[rgba(167,139,250,0.12)] blur-3xl"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div class="grid md:grid-cols-3 gap-10">
      <div>
        <div class="flex items-center gap-3">
          <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-10 h-10 rounded-2xl object-cover shadow-sm" />
          <div>
            <div class="font-semibold text-zinc-950 tracking-tight">{brand}</div>
            <div class="text-xs text-zinc-500">Marketplace viticole B2B</div>
          </div>
        </div>

        <p class="mt-4 text-sm leading-relaxed text-zinc-600 max-w-sm">
          Une plateforme pensée pour connecter producteurs, négociants et acheteurs autour du raisin,
          du jus de raisin et du moût avec une expérience claire, rapide et professionnelle.
        </p>
      </div>

      <div>
        <h4 class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 mb-4">Navigation</h4>
        <div class="space-y-2.5">
          {#each navLinks as link}
            <a href={link.href} class="block text-sm text-zinc-600 hover:text-[rgb(var(--primary-700))] transition">
              {link.label}
            </a>
          {/each}
        </div>
      </div>

      <div>
        <h4 class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 mb-4">Contact</h4>
        <a href="mailto:contact@vitilink.app" class="block text-sm text-zinc-600 hover:text-[rgb(var(--primary-700))] transition mb-4">
          contact@vitilink.app
        </a>

        <a
          href="https://www.linkedin.com/company/vitilinkfrance"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-2xl border border-[rgb(var(--border))] bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-[rgb(var(--primary-50))] hover:text-[rgb(var(--primary-800))] transition shadow-sm"
        >
          LinkedIn
        </a>
      </div>
    </div>

    <div class="mt-10 pt-6 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
      <p class="text-xs text-zinc-500">© {year} {brand}. Tous droits réservés.</p>
      <p class="text-xs text-zinc-400">Conçu avec une identité premium, claire et orientée conversion.</p>
    </div>
  </div>
</footer>