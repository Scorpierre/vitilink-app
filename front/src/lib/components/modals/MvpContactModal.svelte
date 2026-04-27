<!-- src/lib/components/modals/MvpContactModal.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { fade, fly, scale } from "svelte/transition";

  export let open = false;

  // Hauteur approximative de ta navbar fixed (ajuste si besoin)
  // (sur mobile c’est important : on garde l’espace en haut)
  export let topOffsetPx = 72;

  export let title = "Demander un accès MVP";
  export let subtitle =
    "Renseignez vos coordonnées. Nous vous recontactons pour organiser un accès pilote et un court échange.";

  export let primaryLabel = "Envoyer la demande";
  export let secondaryLabel = "Annuler";

  let fullName = "";
  let email = "";
  let organization = "";
  let role = "";
  let message = "";

  const dispatch = createEventDispatcher<{
    close: void;
    submit: {
      fullName: string;
      email: string;
      organization: string;
      role: string;
      message: string;
    };
  }>();

  let emailEl: HTMLInputElement | null = null;

  const close = () => dispatch("close");

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") close();
  };

  function submit() {
    dispatch("submit", { fullName, email, organization, role, message });
  }

  // SSR-safe
  let removeKeyListener: (() => void) | null = null;
  onMount(() => {
    window.addEventListener("keydown", onKeyDown);
    removeKeyListener = () => window.removeEventListener("keydown", onKeyDown);
    return () => removeKeyListener?.();
  });
  onDestroy(() => removeKeyListener?.());

  // autofocus quand open devient true
  $: if (open) queueMicrotask(() => emailEl?.focus());
</script>

{#if open}
  <div class="fixed inset-0 z-120">
    <button
      type="button"
      class="absolute inset-0 cursor-pointer w-full hover:scale-105 transition-all bg-zinc-950/65 backdrop-blur-sm"
      aria-label="Fermer la fenêtre"
      on:click={close}
      in:fade={{ duration: 180 }}
      out:fade={{ duration: 160 }}
    ></button>
    <!-- Wrapper : padding-top pour laisser la navbar respirer -->
    <div
      class="relative mx-auto flex h-full max-w-2xl items-end px-4 pb-6 sm:items-center sm:px-6"
      style={`padding-top:${topOffsetPx}px;`}
    >
      <!-- Panel : fly + fade + scale -->
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        class="relative w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-2xl"
        style={`max-height: calc(100vh - ${topOffsetPx}px - 24px);`}
        in:fly={{ y: 24, duration: 220, easing: (t) => t }}
        out:fly={{ y: 18, duration: 180, easing: (t) => t }}
      >
        <!-- top accent -->
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-brand-600 to-violet-500"></div>

        <!-- blobs color -->
        <div class="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-200/55 blur-3xl"></div>
        <div class="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-brand-100/80 blur-3xl"></div>

        <!-- Scroll container (mobile-friendly) -->
        <div class="relative max-h-[inherit] overflow-y-auto">
          <!-- header -->
          <div class="border-b border-zinc-200 bg-white px-6 py-5 sm:px-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium text-violet-700">Accès pilote • MVP</p>
                <h3 class="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  {title}
                </h3>
                <p class="mt-2 text-sm leading-relaxed text-zinc-600">{subtitle}</p>
              </div>

              <button
                type="button"
                class="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                on:click={close}
              >
                ✕
              </button>
            </div>
          </div>

          <!-- content -->
          <div class="px-6 py-6 sm:px-8">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-sm font-medium text-zinc-900" for="fullName">Nom</label>
                <input
                  id="fullName"
                  class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                  placeholder="Nom Prénom"
                  bind:value={fullName}
                />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium text-zinc-900" for="email">Email *</label>
                <input
                  id="email"
                  bind:this={emailEl}
                  class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                  placeholder="nom@domaine.fr"
                  type="email"
                  required
                  bind:value={email}
                />
              </div>

              <div class="grid gap-2 sm:col-span-2">
                <label class="text-sm font-medium text-zinc-900" for="organization">Organisation</label>
                <input
                  id="organization"
                  class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                  placeholder="Domaine / coopérative / négoce…"
                  bind:value={organization}
                />
              </div>

              <div class="grid gap-2 sm:col-span-2">
                <label class="text-sm font-medium text-zinc-900" for="role">Votre rôle (optionnel)</label>
                <input
                  id="role"
                  class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                  placeholder="Viticulteur, acheteur, responsable cuverie…"
                  bind:value={role}
                />
              </div>

              <div class="grid gap-2 sm:col-span-2">
                <label class="text-sm font-medium text-zinc-900" for="message">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  class="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200"
                  placeholder="Votre besoin, contexte, timing…"
                  bind:value={message}
                ></textarea>
                <p class="text-xs text-zinc-500">Réponse sous 24–48h ouvrées.</p>
              </div>
            </div>

            <!-- actions -->
            <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                class="cursor-pointer rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                on:click={close}
              >
                {secondaryLabel}
              </button>

              <button
                type="button"
                class="cursor-pointer rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-50 disabled:hover:bg-brand-700"
                on:click={submit}
                disabled={!email}
              >
                {primaryLabel}
              </button>
            </div>
          </div>

          <!-- footer -->
          <div class="border-t border-zinc-200 bg-zinc-100 px-6 py-4 text-xs text-zinc-600 sm:px-8">
            En soumettant ce formulaire, vous acceptez d’être recontacté au sujet de l’accès pilote au MVP.
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}