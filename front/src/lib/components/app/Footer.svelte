<script lang="ts">
  const brand = 'VitiLink';
  const year = new Date().getFullYear();

  const navLinks = [
    { label: 'Tableau de bord', href: '/home' },
    { label: 'Marché', href: '/home/marche' },
    { label: 'Contacts', href: '/home/contacts' },
    { label: 'Mentions légales', href: '/legal' },
    { label: 'CGU', href: '/cgu' },
  ];
</script>

<footer class="relative text-white overflow-hidden" style="background-color: #1b1d2d;">
  <!-- Gradient overlay -->
  <!-- Blobs -->
  <div class="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
  <div class="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-900/20 blur-3xl"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Gradient top bar -->
    <div class="h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent mb-10"></div>

    <div class="grid md:grid-cols-3 gap-10">

      <!-- Brand -->
      <div>
        <div class="flex items-center gap-2.5">
          <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-8 h-8 rounded-xl object-cover" />
          <span class="font-semibold text-white text-base tracking-tight">{brand}</span>
        </div>
        <p class="mt-3 text-sm text-white/55 leading-relaxed max-w-xs">
          Marketplace B2B viticole — connectez vignerons, négociants et acheteurs professionnels.
        </p>
        <p class="mt-2 text-xs text-white/30">Projet EIP — Epitech 2027</p>
      </div>

      <!-- Navigation -->
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Navigation</h4>
        <div class="space-y-2.5">
          {#each navLinks as link}
            <a href={link.href} class="block text-sm text-white/55 hover:text-white transition">
              {link.label}
            </a>
          {/each}
        </div>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Contact</h4>
        <a href="mailto:contact@vitilink.app" class="block text-sm text-white/55 hover:text-white transition mb-3">
          contact@vitilink.app
        </a>
        <a
          href="https://www.linkedin.com/company/vitilinkfrance"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5
                 text-sm text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.5H4.5V23.5H.5zM8.5 8.5H12.3V10.6H12.35C12.88 9.6 14.2 8.5 16.2 8.5C20.2 8.5 21 11.1 21 14.6V23.5H17V15.6C17 13.7 17 11.2 14.5 11.2C12 11.2 11.6 13.2 11.6 15.5V23.5H7.6V8.5H8.5z"/>
          </svg>
          LinkedIn
        </a>
      </div>
    </div>

    <div class="mt-10 pt-6 border-t border-white/10 text-center">
      <p class="text-xs text-white/30">© {year} {brand}. Tous droits réservés.</p>
    </div>
  </div>
</footer>
