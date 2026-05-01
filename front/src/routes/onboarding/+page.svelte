<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { UserAPI } from '$lib/api/user';
  import { EntrepriseAPI } from '$lib/api/entreprise';
  import { AuthAPI } from '$lib/api/auth';
  import type { UserRole, CompanyType } from '$lib/types';

  onMount(async () => {
    try {
      const data = await AuthAPI.me();
      if (data.result) user.setUser(data.result);
      else goto('/signIn');
    } catch {
      goto('/signIn');
    }
  });

  const STEPS = [
    { id: 'role', label: 'Rôle' },
    { id: 'identity', label: 'Identité' },
    { id: 'company', label: 'Entreprise' },
    { id: 'location', label: 'Localisation' },
    { id: 'activity', label: 'Activité' }
  ];

  let step = 0;
  let direction = 1;
  let saving = false;
  let saveError = '';

  let role: UserRole = 'BUYER';
  let firstName = '';
  let lastName = '';
  let phone = '';

  let companyName = '';
  let companyType: CompanyType | '' = '';

  let region = '';
  let department = '';

  let appellations: string[] = [];
  let grapeVarieties: string[] = [];
  let surfaceHa = '';
  let annualVolume = '';

  let soughtProducts: string[] = [];
  let soughtVolume = '';

  let appellationInput = '';
  let grapeInput = '';
  let soughtInput = '';

  const REGIONS = [
    'Alsace',
    'Beaujolais',
    'Bordeaux',
    'Bourgogne',
    'Champagne',
    'Corse',
    'Jura',
    'Languedoc-Roussillon',
    'Loire',
    'Provence',
    'Rhône',
    'Savoie',
    'Sud-Ouest'
  ];

  const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
    { value: 'EARL', label: 'EARL' },
    { value: 'GAEC', label: 'GAEC' },
    { value: 'SAS', label: 'SAS' },
    { value: 'SARL', label: 'SARL' },
    { value: 'COOPERATIVE', label: 'Coopérative' },
    { value: 'NEGOCE', label: 'Négoce' },
    { value: 'OTHER', label: 'Autre' }
  ];

  const ROLE_OPTIONS = [
    {
      value: 'SELLER' as UserRole,
      label: 'Vendeur',
      desc: 'Je vends du raisin, du moût ou du jus de raisin'
    },
    {
      value: 'BUYER' as UserRole,
      label: 'Acheteur',
      desc: 'Je recherche des produits viticoles sur la plateforme'
    },
    {
      value: 'BOTH' as UserRole,
      label: 'Vendeur & Acheteur',
      desc: "Je vends et j'achète selon mes besoins"
    }
  ];

  $: isSeller = role === 'SELLER' || role === 'BOTH';
  $: isBuyer = role === 'BUYER' || role === 'BOTH';
  $: isLast = step === STEPS.length - 1;

  function addTag(arr: string[], val: string) {
    const v = val.trim();
    return v && !arr.includes(v) ? [...arr, v] : arr;
  }

  function removeTag(arr: string[], i: number) {
    return arr.filter((_, idx) => idx !== i);
  }

  function buildUserPayload() {
    return {
      role,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined
    };
  }

  function buildEntreprisePayload() {
    return {
      name: companyName || undefined,
      type: (companyType || undefined) as CompanyType | undefined,
      region: region || undefined,
      department: department || undefined,
      appellations: appellations.length ? appellations : undefined,
      grapeVarieties: grapeVarieties.length ? grapeVarieties : undefined,
      surfaceHa: surfaceHa !== '' ? Number(surfaceHa) : undefined,
      annualVolume: annualVolume !== '' ? Number(annualVolume) : undefined,
      soughtProducts: soughtProducts.length ? soughtProducts : undefined,
      soughtVolume: soughtVolume || undefined
    };
  }

  function hasEntrepriseData() {
    return Boolean(
      companyName ||
      companyType ||
      region ||
      department ||
      appellations.length ||
      grapeVarieties.length ||
      surfaceHa !== '' ||
      annualVolume !== '' ||
      soughtProducts.length ||
      soughtVolume
    );
  }

  async function saveStep() {
    saving = true;
    saveError = '';

    try {
      await UserAPI.updateProfile(buildUserPayload());

      if (hasEntrepriseData()) {
        await EntrepriseAPI.updateMine(buildEntreprisePayload());
      }

      return true;
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde, réessayez.';
      return false;
    } finally {
      saving = false;
    }
  }

  async function next() {
    const ok = await saveStep();
    if (!ok) return;

    if (isLast) {
      const data = await UserAPI.getProfile().catch(() => null);
      if (data?.result) user.setUser(data.result);
      goto('/home');
    } else {
      direction = 1;
      step++;
    }
  }

  function prev() {
    direction = -1;
    step--;
  }
</script>

<div class="min-h-screen bg-[linear-gradient(180deg,#fcfbff_0%,#f8f4ff_50%,#fcfbff_100%)]">
  <header class="sticky top-0 z-20 border-b border-[rgb(var(--border))] bg-white/85 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <a href="/" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100">
          <img src="/logo/icon_vitilink.png" alt="VitiLink" class="h-7 w-7 object-contain" />
        </div>

        <div>
          <div class="text-sm font-semibold tracking-tight text-zinc-950">VitiLink</div>
          <div class="text-[11px] text-zinc-500">Configuration de votre profil</div>
        </div>
      </a>

      <div class="text-right">
        <div class="text-xs font-medium text-zinc-400">Onboarding</div>
        <div class="text-sm font-semibold text-zinc-800">
          Étape {step + 1} sur {STEPS.length}
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <div class="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="hidden lg:block">
        <div class="sticky top-24 overflow-hidden rounded-[2rem] border border-violet-100 bg-[linear-gradient(160deg,#22142f_0%,#2d1b3d_50%,#4b2673_100%)] p-6 text-white shadow-[0_20px_60px_rgba(31,13,54,0.18)]">
          <div
            class="absolute pointer-events-none inset-0 opacity-[0.08]"
            style="background-image: radial-gradient(circle, rgba(255,255,255,0.45) 1px, transparent 1px); background-size: 26px 26px;"
          ></div>

          <div class="relative">
            <div class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/75 backdrop-blur-sm">
              Profil professionnel
            </div>

            <h2 class="mt-5 text-2xl font-semibold leading-tight tracking-tight">
              Finalisons votre profil VitiLink
            </h2>

            <p class="mt-3 text-sm leading-6 text-white/70">
              Quelques étapes suffisent pour personnaliser votre espace et améliorer votre visibilité sur la marketplace.
            </p>

            <div class="mt-8 space-y-3">
              {#each STEPS as s, i}
                <div
                  class={`rounded-2xl border px-4 py-3 transition ${
                    i === step
                      ? 'border-white/20 bg-white/12'
                      : i < step
                        ? 'border-white/10 bg-white/8'
                        : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  <div class="flex items-center gap-3">
                    <div
                      class={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold ${
                        i === step
                          ? 'bg-violet-300 text-violet-950'
                          : i < step
                            ? 'bg-white/15 text-white'
                            : 'bg-white/8 text-white/60'
                      }`}
                    >
                      {#if i < step}✓{:else}{i + 1}{/if}
                    </div>
                    <div class="text-sm font-medium text-white/85">{s.label}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </aside>

      <section>
        <div class="mb-6">
          <div class="mb-4 flex gap-2">
            {#each STEPS as _, i}
              <div class={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-violet-500' : 'bg-violet-100'
              }`}></div>
            {/each}
          </div>
        </div>

        {#key step}
          <div
            in:fly={{ x: direction * 26, opacity: 0, duration: 220, delay: 40 }}
            out:fly={{ x: direction * -26, opacity: 0, duration: 160 }}
            class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-[0_20px_60px_rgba(31,13,54,0.06)] sm:p-8"
          >
            {#if step === 0}
              <div class="mb-8">
                <div class="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  Étape 1 sur {STEPS.length}
                </div>
                <h1 class="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Quel est votre rôle sur VitiLink ?
                </h1>
                <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Cela nous permet d’adapter votre expérience, vos champs de profil et les opportunités visibles sur la plateforme.
                </p>
              </div>

              <div class="grid gap-4">
                {#each ROLE_OPTIONS as opt}
                  <button
                    type="button"
                    on:click={() => (role = opt.value)}
                    class={`w-full rounded-3xl border p-5 text-left transition ${
                      role === opt.value
                        ? 'border-violet-300 bg-violet-50 shadow-[0_10px_30px_rgba(124,58,237,0.10)]'
                        : 'border-zinc-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'
                    }`}
                  >
                    <div class="flex items-start gap-4">
                      <div class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        role === opt.value ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {#if opt.value === 'SELLER'}
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="7"></circle>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.2 7.2 5.8 5.8M18.2 18.2l-1.4-1.4M16.8 7.2l1.4-1.4M7.2 16.8l-1.4 1.4" />
                          </svg>
                        {:else if opt.value === 'BUYER'}
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h2l2.2 9.2a1 1 0 001 .8H18a1 1 0 001-.76L21 8H7" />
                            <circle cx="10" cy="19" r="1.5"></circle>
                            <circle cx="17" cy="19" r="1.5"></circle>
                          </svg>
                        {:else}
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10" />
                            <circle cx="18" cy="17" r="3"></circle>
                          </svg>
                        {/if}
                      </div>

                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h3 class="text-base font-semibold text-zinc-950">{opt.label}</h3>
                          {#if role === opt.value}
                            <span class="inline-flex rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-medium text-white">
                              Sélectionné
                            </span>
                          {/if}
                        </div>
                        <p class="mt-1 text-sm leading-6 text-zinc-500">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>

            {:else if step === 1}
              <div class="mb-8">
                <div class="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  Étape 2 sur {STEPS.length}
                </div>
                <h1 class="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Votre identité
                </h1>
                <p class="mt-2 text-sm leading-6 text-zinc-500">
                  Ces informations renforcent la confiance et rendent votre profil plus clair pour les autres professionnels.
                </p>
              </div>

              <div class="grid gap-5">
                <div class="grid gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="firstName" class="block text-sm font-medium text-zinc-800">Prénom</label>
                    <input
                      id="firstName"
                      bind:value={firstName}
                      type="text"
                      placeholder="Jean"
                      class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="lastName" class="block text-sm font-medium text-zinc-800">Nom</label>
                    <input
                      id="lastName"
                      bind:value={lastName}
                      type="text"
                      placeholder="Dupont"
                      class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="phone" class="block text-sm font-medium text-zinc-800">Téléphone professionnel</label>
                  <input
                    id="phone"
                    bind:value={phone}
                    type="tel"
                    placeholder="+33 6 00 00 00 00"
                    class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

            {:else if step === 2}
              <div class="mb-8">
                <div class="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  Étape 3 sur {STEPS.length}
                </div>
                <h1 class="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Votre entreprise
                </h1>
                <p class="mt-2 text-sm leading-6 text-zinc-500">
                  Présentez votre structure de manière claire pour inspirer confiance dès le premier contact.
                </p>
              </div>

              <div class="grid gap-5">
                <div class="space-y-2">
                  <label for="companyName" class="block text-sm font-medium text-zinc-800">Nom de l’exploitation / société</label>
                  <input
                    id="companyName"
                    bind:value={companyName}
                    type="text"
                    placeholder="Domaine de la Vigne"
                    class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div class="space-y-2">
                  <label for="companyType" class="block text-sm font-medium text-zinc-800">Type de structure</label>
                  <select
                    id="companyType"
                    bind:value={companyType}
                    class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="">Sélectionner</option>
                    {#each COMPANY_TYPES as ct}
                      <option value={ct.value}>{ct.label}</option>
                    {/each}
                  </select>
                </div>
              </div>

            {:else if step === 3}
              <div class="mb-8">
                <div class="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  Étape 4 sur {STEPS.length}
                </div>
                <h1 class="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Votre localisation
                </h1>
                <p class="mt-2 text-sm leading-6 text-zinc-500">
                  La localisation permet aux acheteurs et vendeurs de mieux situer votre activité et vos opportunités.
                </p>
              </div>

              <div class="grid gap-5">
                <div class="space-y-2">
                  <label for="region" class="block text-sm font-medium text-zinc-800">Région viticole</label>
                  <select
                    id="region"
                    bind:value={region}
                    class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="">Sélectionner</option>
                    {#each REGIONS as r}
                      <option value={r}>{r}</option>
                    {/each}
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="department" class="block text-sm font-medium text-zinc-800">Département</label>
                  <input
                    id="department"
                    bind:value={department}
                    type="text"
                    placeholder="Gironde, Côte-d'Or..."
                    class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

            {:else if step === 4}
              <div class="mb-8">
                <div class="inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  Étape 5 sur {STEPS.length}
                </div>
                <h1 class="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
                  Votre activité
                </h1>
                <p class="mt-2 text-sm leading-6 text-zinc-500">
                  Un profil plus complet améliore la pertinence des mises en relation et la qualité de votre présence sur VitiLink.
                </p>
              </div>

              <div class="space-y-5">
                {#if isSeller}
                  <div class="rounded-3xl border border-violet-100 bg-violet-50/40 p-5 sm:p-6">
                    <div class="mb-5 flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <circle cx="12" cy="12" r="7"></circle>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5V3M12 21v-2M5 12H3M21 12h-2M7.2 7.2 5.8 5.8M18.2 18.2l-1.4-1.4M16.8 7.2l1.4-1.4M7.2 16.8l-1.4 1.4" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-base font-semibold text-zinc-950">Informations vendeur</h3>
                        <p class="text-sm text-zinc-500">Ce que vous produisez et proposez sur la marketplace.</p>
                      </div>
                    </div>

                    <div class="space-y-5">
                      <div class="space-y-2">
                        <label for="appellationInput" class="block text-sm font-medium text-zinc-800">Appellations</label>
                        <div class="flex flex-wrap gap-2">
                          {#each appellations as tag, i}
                            <span class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700">
                              {tag}
                              <button type="button" on:click={() => (appellations = removeTag(appellations, i))} class="text-violet-400 hover:text-violet-700">
                                ×
                              </button>
                            </span>
                          {/each}
                        </div>
                        <input
                          id="appellationInput"
                          bind:value={appellationInput}
                          type="text"
                          placeholder="Ex : Bordeaux, Pomerol... (Entrée pour ajouter)"
                          on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (appellationInput.trim()) {
                                appellations = addTag(appellations, appellationInput);
                                appellationInput = '';
                              }
                            }
                          }}
                          class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>

                      <div class="space-y-2">
                        <label for="grapeInput" class="block text-sm font-medium text-zinc-800">Cépages principaux</label>
                        <div class="flex flex-wrap gap-2">
                          {#each grapeVarieties as tag, i}
                            <span class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700">
                              {tag}
                              <button type="button" on:click={() => (grapeVarieties = removeTag(grapeVarieties, i))} class="text-violet-400 hover:text-violet-700">
                                ×
                              </button>
                            </span>
                          {/each}
                        </div>
                        <input
                          id="grapeInput"
                          bind:value={grapeInput}
                          type="text"
                          placeholder="Ex : Merlot, Chardonnay... (Entrée pour ajouter)"
                          on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (grapeInput.trim()) {
                                grapeVarieties = addTag(grapeVarieties, grapeInput);
                                grapeInput = '';
                              }
                            }
                          }}
                          class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>

                      <div class="grid gap-5 sm:grid-cols-2">
                        <div class="space-y-2">
                          <label for="surfaceHa" class="block text-sm font-medium text-zinc-800">Surface (ha)</label>
                          <input
                            id="surfaceHa"
                            bind:value={surfaceHa}
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Ex : 12.5"
                            class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                          />
                        </div>

                        <div class="space-y-2">
                          <label for="annualVolume" class="block text-sm font-medium text-zinc-800">Volume annuel (hL)</label>
                          <input
                            id="annualVolume"
                            bind:value={annualVolume}
                            type="number"
                            min="0"
                            placeholder="Ex : 500"
                            class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}

                {#if isBuyer}
                  <div class="rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-sm">
                    <div class="mb-5 flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h2l2.2 9.2a1 1 0 001 .8H18a1 1 0 001-.76L21 8H7" />
                          <circle cx="10" cy="19" r="1.5"></circle>
                          <circle cx="17" cy="19" r="1.5"></circle>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-base font-semibold text-zinc-950">Informations acheteur</h3>
                        <p class="text-sm text-zinc-500">Les produits et volumes que vous recherchez.</p>
                      </div>
                    </div>

                    <div class="space-y-5">
                      <div class="space-y-2">
                        <label for="soughtInput" class="block text-sm font-medium text-zinc-800">Produits recherchés</label>
                        <div class="flex flex-wrap gap-2">
                          {#each soughtProducts as tag, i}
                            <span class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                              {tag}
                              <button type="button" on:click={() => (soughtProducts = removeTag(soughtProducts, i))} class="text-violet-400 hover:text-violet-700">
                                ×
                              </button>
                            </span>
                          {/each}
                        </div>
                        <input
                          id="soughtInput"
                          bind:value={soughtInput}
                          type="text"
                          placeholder="Ex : Raisin rouge, Moût... (Entrée pour ajouter)"
                          on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              if (soughtInput.trim()) {
                                soughtProducts = addTag(soughtProducts, soughtInput);
                                soughtInput = '';
                              }
                            }
                          }}
                          class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>

                      <div class="space-y-2">
                        <label for="soughtVolume" class="block text-sm font-medium text-zinc-800">Volume souhaité</label>
                        <input
                          id="soughtVolume"
                          bind:value={soughtVolume}
                          type="text"
                          placeholder="Ex : 200-500 hL/an"
                          class="w-full rounded-2xl border border-violet-100 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            {#if saveError}
              <div class="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clip-rule="evenodd" />
                </svg>
                <span>{saveError}</span>
              </div>
            {/if}

            <div class="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                on:click={prev}
                class={`inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 ${
                  step === 0 ? 'invisible' : ''
                }`}
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Précédent
              </button>

              <button
                type="button"
                on:click={next}
                disabled={saving}
                class="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style="background: linear-gradient(135deg, #6d35a8 0%, #8b5cf6 100%); box-shadow: 0 14px 28px rgba(124, 58, 237, 0.22);"
              >
                {#if saving}
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                    <path class="opacity-90" d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
                  </svg>
                {/if}

                {isLast ? 'Accéder à VitiLink' : 'Continuer'}

                {#if !saving && !isLast}
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                {/if}
              </button>
            </div>
          </div>
        {/key}
      </section>
    </div>
  </main>
</div>