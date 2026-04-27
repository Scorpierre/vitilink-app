<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { UserAPI } from '$lib/api/user';
  import { AuthAPI } from '$lib/api/auth';
  import type { UserRole, CompanyType } from '$lib/types';

  // ── Auth guard ─────────────────────────────────────────────────────────
  onMount(async () => {
    try {
      const data = await AuthAPI.me();
      if (data.result) user.setUser(data.result);
      else goto('/signIn');
    } catch {
      goto('/signIn');
    }
  });

  // ── Steps definition ───────────────────────────────────────────────────
  const STEPS = [
    { id: 'role',      label: 'Rôle'        },
    { id: 'identity',  label: 'Identité'    },
    { id: 'company',   label: 'Entreprise'  },
    { id: 'location',  label: 'Localisation'},
    { id: 'activity',  label: 'Activité'    },
  ];

  let step = 0;
  let direction = 1;
  let saving = false;
  let saveError = '';

  // ── Form data ──────────────────────────────────────────────────────────
  let role: UserRole = 'BUYER';
  let firstName = '';
  let lastName  = '';
  let phone     = '';

  let companyName: string    = '';
  let companyType: CompanyType | '' = '';

  let region     = '';
  let department = '';

  let appellations:   string[] = [];
  let grapeVarieties: string[] = [];
  let surfaceHa    = '';
  let annualVolume = '';

  let soughtProducts: string[] = [];
  let soughtVolume = '';

  // Tag inputs
  let appellationInput = '';
  let grapeInput       = '';
  let soughtInput      = '';

  // ── Options ────────────────────────────────────────────────────────────
  const REGIONS = [
    'Alsace','Beaujolais','Bordeaux','Bourgogne','Champagne',
    'Corse','Jura','Languedoc-Roussillon','Loire','Provence',
    'Rhône','Savoie','Sud-Ouest',
  ];

  const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
    { value: 'EARL',        label: 'EARL'         },
    { value: 'GAEC',        label: 'GAEC'         },
    { value: 'SAS',         label: 'SAS'          },
    { value: 'SARL',        label: 'SARL'         },
    { value: 'COOPERATIVE', label: 'Coopérative'  },
    { value: 'NEGOCE',      label: 'Négoce'       },
    { value: 'OTHER',       label: 'Autre'        },
  ];

  const ROLE_OPTIONS = [
    { value: 'SELLER' as UserRole, label: 'Vendeur',            desc: "Je vends du raisin, moût ou jus"        },
    { value: 'BUYER'  as UserRole, label: 'Acheteur',           desc: "Je recherche des produits viticoles"    },
    { value: 'BOTH'   as UserRole, label: 'Vendeur & Acheteur', desc: "Je vends et j'achète sur la plateforme" },
  ];

  // ── Computed ───────────────────────────────────────────────────────────
  $: isSeller = role === 'SELLER' || role === 'BOTH';
  $: isBuyer  = role === 'BUYER'  || role === 'BOTH';
  $: isLast   = step === STEPS.length - 1;
  $: canSkip  = step > 0;

  // ── Helpers ────────────────────────────────────────────────────────────
  function addTag(arr: string[], val: string) {
    const v = val.trim();
    return v && !arr.includes(v) ? [...arr, v] : arr;
  }
  function removeTag(arr: string[], i: number) {
    return arr.filter((_, idx) => idx !== i);
  }
  function onTagKey(e: KeyboardEvent, field: 'appellations' | 'grapeVarieties' | 'soughtProducts', inputRef: { val: string }) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputRef.val.trim()) {
        if (field === 'appellations')   appellations   = addTag(appellations,   inputRef.val);
        if (field === 'grapeVarieties') grapeVarieties = addTag(grapeVarieties, inputRef.val);
        if (field === 'soughtProducts') soughtProducts = addTag(soughtProducts, inputRef.val);
        inputRef.val = '';
      }
    }
  }

  function buildPayload() {
    return {
      role,
      firstName:      firstName     || undefined,
      lastName:       lastName      || undefined,
      phone:          phone         || undefined,
      companyName:    companyName   || undefined,
      companyType:    (companyType  || undefined) as CompanyType | undefined,
      region:         region        || undefined,
      department:     department    || undefined,
      appellations:   appellations.length  ? appellations   : undefined,
      grapeVarieties: grapeVarieties.length ? grapeVarieties : undefined,
      surfaceHa:      surfaceHa    !== '' ? Number(surfaceHa)    : undefined,
      annualVolume:   annualVolume !== '' ? Number(annualVolume)  : undefined,
      soughtProducts: soughtProducts.length ? soughtProducts : undefined,
      soughtVolume:   soughtVolume  || undefined,
    };
  }

  async function saveStep() {
    saving = true;
    saveError = '';
    try {
      await UserAPI.updateProfile(buildPayload());
    } catch {
      saveError = 'Erreur lors de la sauvegarde, réessayez.';
      saving = false;
      return false;
    }
    saving = false;
    return true;
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

  async function skip() {
    direction = 1;
    step++;
  }

  function prev() {
    direction = -1;
    step--;
  }
</script>


<div class="min-h-screen bg-stone-50 flex flex-col">

  <!-- ── Top bar ─────────────────────────────────────────────────────── -->
  <header class="bg-white border-b border-zinc-100 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
    <a href="/" class="flex items-center gap-2.5">
      <img src="/logo/icon_vitilink.png" alt="VitiLink" class="w-7 h-7 rounded-lg object-cover" />
      <span class="font-semibold text-zinc-900 text-sm tracking-tight">VitiLink</span>
    </a>

    <!-- Progress steps (desktop) -->
    <nav class="hidden sm:flex items-center gap-1">
      {#each STEPS as s, i}
        <div class="flex items-center gap-1">
          <button
            on:click={() => { if (i < step) { direction = -1; step = i; } }}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition
              {i === step   ? 'bg-brand-600 text-white'
              : i < step    ? 'bg-brand-100 text-brand-700 cursor-pointer hover:bg-brand-200'
              : 'text-zinc-400 cursor-default'}"
          >
            {#if i < step}
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            {:else}
              <span>{i + 1}</span>
            {/if}
            {s.label}
          </button>
          {#if i < STEPS.length - 1}
            <div class="w-4 h-px {i < step ? 'bg-brand-300' : 'bg-zinc-200'}"></div>
          {/if}
        </div>
      {/each}
    </nav>

    <!-- Mobile step count -->
    <span class="sm:hidden text-xs text-zinc-500 font-medium">{step + 1} / {STEPS.length}</span>

    {#if canSkip && !isLast}
      <button on:click={skip} class="text-xs text-zinc-400 hover:text-zinc-600 transition">
        Passer →
      </button>
    {:else}
      <div class="w-16"></div>
    {/if}
  </header>

  <!-- ── Content ─────────────────────────────────────────────────────── -->
  <main class="flex-1 flex items-start justify-center px-4 py-10 sm:py-16">
    <div class="w-full max-w-xl">

      <!-- Progress bar -->
      <div class="flex gap-1 mb-8">
        {#each STEPS as _, i}
          <div class="flex-1 h-1 rounded-full transition-all duration-500 {i <= step ? 'bg-brand-500' : 'bg-zinc-200'}"></div>
        {/each}
      </div>

      {#key step}
        <div
          in:fly={{ x: direction * 32, opacity: 0, duration: 240, delay: 60 }}
          out:fly={{ x: direction * -32, opacity: 0, duration: 180 }}
        >

          <!-- ── STEP 0 : Rôle ──────────────────────────────────────── -->
          {#if step === 0}
            <div class="mb-8">
              <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Étape 1 sur {STEPS.length}</p>
              <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Quel est votre rôle ?</h1>
              <p class="mt-2 text-sm text-zinc-500 leading-relaxed">Cela définit ce que vous pouvez faire sur VitiLink. Vous pourrez le changer à tout moment.</p>
            </div>

            <div class="space-y-3">
              {#each ROLE_OPTIONS as opt}
                <button
                  type="button"
                  on:click={() => role = opt.value}
                  class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150
                    {role === opt.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'}"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-zinc-900">{opt.label}</span>
                        {#if role === opt.value}
                          <svg class="w-4 h-4 text-brand-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        {/if}
                      </div>
                      <p class="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              {/each}
            </div>

          <!-- ── STEP 1 : Identité ──────────────────────────────────── -->
          {:else if step === 1}
            <div class="mb-8">
              <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Étape 2 sur {STEPS.length}</p>
              <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Votre identité</h1>
              <p class="mt-2 text-sm text-zinc-500">Ces informations apparaîtront sur votre profil public.</p>
            </div>

            <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Prénom</label>
                  <input bind:value={firstName} type="text" placeholder="Jean"
                    class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Nom</label>
                  <input bind:value={lastName} type="text" placeholder="Dupont"
                    class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Téléphone professionnel</label>
                <input bind:value={phone} type="tel" placeholder="+33 6 00 00 00 00"
                  class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
              </div>
            </div>

          <!-- ── STEP 2 : Entreprise ─────────────────────────────────── -->
          {:else if step === 2}
            <div class="mb-8">
              <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Étape 3 sur {STEPS.length}</p>
              <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Votre entreprise</h1>
              <p class="mt-2 text-sm text-zinc-500">Renseignez votre structure professionnelle pour inspirer confiance.</p>
            </div>

            <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Nom de l'exploitation / société</label>
                <input bind:value={companyName} type="text" placeholder="Domaine de la Vigne"
                  class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Type de structure</label>
                <select bind:value={companyType}
                  class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition bg-white appearance-none">
                  <option value="">— Sélectionner —</option>
                  {#each COMPANY_TYPES as ct}
                    <option value={ct.value}>{ct.label}</option>
                  {/each}
                </select>
              </div>
            </div>

          <!-- ── STEP 3 : Localisation ───────────────────────────────── -->
          {:else if step === 3}
            <div class="mb-8">
              <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Étape 4 sur {STEPS.length}</p>
              <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Votre localisation</h1>
              <p class="mt-2 text-sm text-zinc-500">Permet aux autres professionnels de vous trouver plus facilement.</p>
            </div>

            <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Région viticole</label>
                <select bind:value={region}
                  class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition bg-white appearance-none">
                  <option value="">— Sélectionner —</option>
                  {#each REGIONS as r}
                    <option value={r}>{r}</option>
                  {/each}
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Département</label>
                <input bind:value={department} type="text" placeholder="ex : Gironde, Côte-d'Or…"
                  class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
              </div>
            </div>

          <!-- ── STEP 4 : Activité ───────────────────────────────────── -->
          {:else if step === 4}
            <div class="mb-8">
              <p class="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Étape 5 sur {STEPS.length}</p>
              <h1 class="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">Votre activité</h1>
              <p class="mt-2 text-sm text-zinc-500">Plus votre profil est complet, plus vite vous trouverez les bons partenaires.</p>
            </div>

            <div class="space-y-4">

              {#if isSeller}
                <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
                  <h3 class="text-sm font-semibold text-zinc-900 mb-1">Côté vendeur</h3>

                  <!-- Appellations -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Appellations</label>
                    <div class="flex flex-wrap gap-2">
                      {#each appellations as tag, i}
                        <span class="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 ring-1 ring-brand-200/60">
                          {tag}
                          <button type="button" on:click={() => appellations = removeTag(appellations, i)} class="text-brand-400 hover:text-brand-700 leading-none">×</button>
                        </span>
                      {/each}
                    </div>
                    <input
                      bind:value={appellationInput}
                      type="text"
                      placeholder="ex : Bordeaux, Pomerol… (Entrée pour ajouter)"
                      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (appellationInput.trim()) { appellations = addTag(appellations, appellationInput); appellationInput = ''; } } }}
                      class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
                    />
                  </div>

                  <!-- Cépages -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Cépages principaux</label>
                    <div class="flex flex-wrap gap-2">
                      {#each grapeVarieties as tag, i}
                        <span class="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1 ring-1 ring-violet-200/60">
                          {tag}
                          <button type="button" on:click={() => grapeVarieties = removeTag(grapeVarieties, i)} class="text-violet-400 hover:text-violet-700 leading-none">×</button>
                        </span>
                      {/each}
                    </div>
                    <input
                      bind:value={grapeInput}
                      type="text"
                      placeholder="ex : Merlot, Chardonnay… (Entrée pour ajouter)"
                      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (grapeInput.trim()) { grapeVarieties = addTag(grapeVarieties, grapeInput); grapeInput = ''; } } }}
                      class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
                    />
                  </div>

                  <!-- Surface & Volume -->
                  <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Surface (ha)</label>
                      <input bind:value={surfaceHa} type="number" min="0" step="0.1" placeholder="ex : 12.5"
                        class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Volume annuel (hL)</label>
                      <input bind:value={annualVolume} type="number" min="0" placeholder="ex : 500"
                        class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
                    </div>
                  </div>
                </div>
              {/if}

              {#if isBuyer}
                <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
                  <h3 class="text-sm font-semibold text-zinc-900 mb-1">Côté acheteur</h3>

                  <!-- Produits recherchés -->
                  <div class="space-y-2">
                    <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Produits recherchés</label>
                    <div class="flex flex-wrap gap-2">
                      {#each soughtProducts as tag, i}
                        <span class="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 ring-1 ring-emerald-200/60">
                          {tag}
                          <button type="button" on:click={() => soughtProducts = removeTag(soughtProducts, i)} class="text-emerald-400 hover:text-emerald-700 leading-none">×</button>
                        </span>
                      {/each}
                    </div>
                    <input
                      bind:value={soughtInput}
                      type="text"
                      placeholder="ex : Raisin rouge, Moût… (Entrée pour ajouter)"
                      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (soughtInput.trim()) { soughtProducts = addTag(soughtProducts, soughtInput); soughtInput = ''; } } }}
                      class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
                    />
                  </div>

                  <!-- Volume souhaité -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Volume souhaité</label>
                    <input bind:value={soughtVolume} type="text" placeholder="ex : 200–500 hL/an"
                      class="w-full px-3.5 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
                  </div>
                </div>
              {/if}

            </div>
          {/if}

          <!-- ── Error ─────────────────────────────────────────────── -->
          {#if saveError}
            <div class="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
              </svg>
              {saveError}
            </div>
          {/if}

          <!-- ── Navigation ────────────────────────────────────────── -->
          <div class="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              on:click={prev}
              class="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition
                {step === 0 ? 'invisible' : ''}"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>

            <button
              type="button"
              on:click={next}
              disabled={saving}
              class="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-900/20 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {#if saving}
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              {/if}
              {isLast ? 'Accéder à VitiLink' : 'Continuer'}
              {#if !saving && !isLast}
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              {/if}
            </button>
          </div>

        </div>
      {/key}

    </div>
  </main>
</div>
