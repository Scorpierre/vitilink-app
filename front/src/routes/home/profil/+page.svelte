<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { AuthAPI } from '$lib/api/auth';
  import { UserAPI } from '$lib/api/user';
  import type { UserRole, CompanyType } from '$lib/types';

  // ── State ──────────────────────────────────────────────────────────────
  let editing = false;
  let saving = false;
  let loadingProfile = true;
  let saveError = '';
  let saveSuccess = false;

  // Form state (copy of user fields for editing)
  let form = {
    username:      '',
    role:          'BUYER' as UserRole,
    firstName:     '',
    lastName:      '',
    phone:         '',
    companyName:   '',
    companyType:   '' as CompanyType | '',
    region:        '',
    department:    '',
    appellations:  [] as string[],
    grapeVarieties:[] as string[],
    surfaceHa:     '' as number | '',
    annualVolume:  '' as number | '',
    soughtProducts:[] as string[],
    soughtVolume:  '',
  };

  // Tag input state
  let appellationInput  = '';
  let grapeInput        = '';
  let soughtInput       = '';

  // ── Options ────────────────────────────────────────────────────────────
  const REGIONS = [
    'Alsace', 'Beaujolais', 'Bordeaux', 'Bourgogne', 'Champagne',
    'Corse', 'Jura', 'Languedoc-Roussillon', 'Loire', 'Provence',
    'Rhône', 'Savoie', 'Sud-Ouest',
  ];

  const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
    { value: 'EARL',        label: 'EARL' },
    { value: 'GAEC',        label: 'GAEC' },
    { value: 'SAS',         label: 'SAS' },
    { value: 'SARL',        label: 'SARL' },
    { value: 'COOPERATIVE', label: 'Coopérative' },
    { value: 'NEGOCE',      label: 'Négoce' },
    { value: 'OTHER',       label: 'Autre' },
  ];

  const ROLE_OPTIONS: { value: UserRole; label: string; desc: string}[] = [
    { value: 'SELLER', label: 'Vendeur',          desc: 'Je publie des offres de raisin, moût ou jus' },
    { value: 'BUYER',  label: 'Acheteur',          desc: 'Je recherche des produits viticoles' },
    { value: 'BOTH',   label: 'Vendeur & Acheteur', desc: 'Je vends et j\'achète sur la plateforme' },
  ];

  // ── Computed ────────────────────────────────────────────────────────────
  $: isSeller = form.role === 'SELLER' || form.role === 'BOTH';
  $: isBuyer  = form.role === 'BUYER'  || form.role === 'BOTH';

  $: roleLabel = ROLE_OPTIONS.find(r => r.value === ($user?.role ?? 'BUYER'))?.label ?? '—';
  $: roleBadgeClass =
    $user?.role === 'SELLER' ? 'bg-brand-50 text-brand-700 ring-brand-200/60' :
    $user?.role === 'BUYER'  ? 'bg-violet-50 text-violet-700 ring-violet-200/60' :
                               'bg-amber-50 text-amber-700 ring-amber-200/60';

  $: initials = (($user?.firstName?.[0] ?? '') + ($user?.lastName?.[0] ?? ''))
    || ($user?.username?.[0]?.toUpperCase() ?? 'U');

  // ── Lifecycle ──────────────────────────────────────────────────────────
  onMount(async () => {
    try {
      const data = await UserAPI.getProfile();
      if (data.result) user.setUser(data.result);
    } catch {}
    loadingProfile = false;
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  function startEditing() {
    const u = $user;
    form = {
      username:       u?.username       ?? '',
      role:           u?.role           ?? 'BUYER',
      firstName:      u?.firstName      ?? '',
      lastName:       u?.lastName       ?? '',
      phone:          u?.phone          ?? '',
      companyName:    u?.companyName    ?? '',
      companyType:    u?.companyType    ?? '',
      region:         u?.region         ?? '',
      department:     u?.department     ?? '',
      appellations:   [...(u?.appellations   ?? [])],
      grapeVarieties: [...(u?.grapeVarieties ?? [])],
      surfaceHa:      u?.surfaceHa      ?? '',
      annualVolume:   u?.annualVolume   ?? '',
      soughtProducts: [...(u?.soughtProducts ?? [])],
      soughtVolume:   u?.soughtVolume   ?? '',
    };
    appellationInput = grapeInput = soughtInput = '';
    editing = true;
    saveError = '';
    saveSuccess = false;
  }

  function cancelEditing() {
    editing = false;
    saveError = '';
  }

  async function save() {
    saving = true;
    saveError = '';
    saveSuccess = false;
    try {
      await UserAPI.updateProfile({
        ...form,
        surfaceHa:    form.surfaceHa   !== '' ? Number(form.surfaceHa)   : undefined,
        annualVolume: form.annualVolume !== '' ? Number(form.annualVolume): undefined,
        companyType:  form.companyType || undefined,
      });
      const data = await UserAPI.getProfile();
      if (data.result) user.setUser(data.result);
      editing = false;
      saveSuccess = true;
      setTimeout(() => saveSuccess = false, 3000);
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde';
    } finally {
      saving = false;
    }
  }

  function addTag(arr: string[], val: string): string[] {
    const v = val.trim();
    if (v && !arr.includes(v)) return [...arr, v];
    return arr;
  }

  function handleTagKey(e: KeyboardEvent, field: 'appellations' | 'grapeVarieties' | 'soughtProducts', inputVar: () => string, setter: (v: string) => void) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputVar();
      if (val.trim()) {
        form[field] = addTag(form[field], val);
        setter('');
      }
    }
  }

  function removeTag(arr: string[], i: number): string[] {
    return arr.filter((_, idx) => idx !== i);
  }

  async function logout() {
    try { await AuthAPI.logout(); } catch {}
    user.clear();
    goto('/signIn');
  }
</script>


<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

  <!-- Breadcrumb -->
  <div class="flex items-center gap-2 text-sm text-zinc-400 mb-8">
    <a href="/home" class="hover:text-zinc-600 transition">Tableau de bord</a>
    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
    <span class="text-zinc-600 font-medium">Mon profil</span>
  </div>

  {#if loadingProfile}
    <div class="flex items-center justify-center py-24 text-zinc-400 text-sm">Chargement…</div>
  {:else}

  <!-- ── Header card ──────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mb-5 flex items-center justify-between gap-5">
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center ring-2 ring-brand-200/60 shrink-0">
        <span class="text-xl font-bold text-brand-700">{initials}</span>
      </div>
      <div>
        <h1 class="text-lg font-semibold text-zinc-900">
          {[$user?.firstName, $user?.lastName].filter(Boolean).join(' ') || $user?.username || '—'}
        </h1>
        {#if $user?.companyName}
          <p class="text-sm text-zinc-500">{$user.companyName}</p>
        {/if}
        <span class="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 ring-1 {roleBadgeClass}">
          {roleLabel}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      {#if saveSuccess}
        <span class="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Enregistré
        </span>
      {/if}
      {#if editing}
        <button on:click={cancelEditing} class="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition">
          Annuler
        </button>
        <button on:click={save} disabled={saving} class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition disabled:opacity-60 flex items-center gap-1.5">
          {#if saving}
            <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          {/if}
          Enregistrer
        </button>
      {:else}
        <button on:click={startEditing} class="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
          </svg>
          Modifier le profil
        </button>
      {/if}
    </div>
  </div>

  {#if saveError}
    <div class="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
      <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
      </svg>
      {saveError}
    </div>
  {/if}

  <!-- ── Rôle ─────────────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
    <div class="px-6 py-4 border-b border-zinc-100">
      <h2 class="text-sm font-semibold text-zinc-900">Votre rôle</h2>
      <p class="text-xs text-zinc-400 mt-0.5">Définit ce que vous pouvez faire sur la plateforme</p>
    </div>
    <div class="p-5">
      {#if editing}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {#each ROLE_OPTIONS as opt}
            <button
              type="button"
              on:click={() => form.role = opt.value}
              class="text-left p-4 rounded-xl border transition {form.role === opt.value
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-300/60'
                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}"
            >
              <div class="text-sm font-semibold text-zinc-900">{opt.label}</div>
              <div class="text-xs text-zinc-500 mt-0.5 leading-relaxed">{opt.desc}</div>
            </button>
          {/each}
        </div>
      {:else}
        {#each ROLE_OPTIONS.filter(r => r.value === ($user?.role ?? 'BUYER')) as opt}
          <div class="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <div>
              <div class="text-sm font-semibold text-zinc-900">{opt.label}</div>
              <div class="text-xs text-zinc-500 mt-0.5">{opt.desc}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- ── Identité ─────────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
    <div class="px-6 py-4 border-b border-zinc-100">
      <h2 class="text-sm font-semibold text-zinc-900">Identité</h2>
    </div>
    <div class="p-6 grid sm:grid-cols-2 gap-4">

      {#if editing}
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Prénom</label>
          <input bind:value={form.firstName} type="text" placeholder="Jean" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Nom</label>
          <input bind:value={form.lastName} type="text" placeholder="Dupont" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Nom d'utilisateur</label>
          <input bind:value={form.username} type="text" placeholder="jean.dupont" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Téléphone</label>
          <input bind:value={form.phone} type="tel" placeholder="+33 6 00 00 00 00" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
      {:else}
        {#each [
          ['Prénom',              $user?.firstName  || '—'],
          ['Nom',                 $user?.lastName   || '—'],
          ["Nom d'utilisateur",   $user?.username   || '—'],
          ['Téléphone',           $user?.phone      || '—'],
        ] as [label, value]}
          <div class="space-y-1">
            <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</div>
            <div class="text-sm font-medium text-zinc-900">{value}</div>
          </div>
        {/each}
      {/if}

    </div>
  </div>

  <!-- ── Entreprise ───────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
    <div class="px-6 py-4 border-b border-zinc-100">
      <h2 class="text-sm font-semibold text-zinc-900">Entreprise</h2>
    </div>
    <div class="p-6 grid sm:grid-cols-2 gap-4">

      {#if editing}
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Nom de l'exploitation / société</label>
          <input bind:value={form.companyName} type="text" placeholder="Domaine de la Vigne" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Type de structure</label>
          <select bind:value={form.companyType} class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition bg-white">
            <option value="">— Sélectionner —</option>
            {#each COMPANY_TYPES as ct}
              <option value={ct.value}>{ct.label}</option>
            {/each}
          </select>
        </div>
      {:else}
        {#each [
          ["Nom de l'exploitation", $user?.companyName || '—'],
          ['Type de structure',     COMPANY_TYPES.find(c => c.value === $user?.companyType)?.label || '—'],
        ] as [label, value]}
          <div class="space-y-1">
            <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</div>
            <div class="text-sm font-medium text-zinc-900">{value}</div>
          </div>
        {/each}
      {/if}

    </div>
  </div>

  <!-- ── Localisation ─────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
    <div class="px-6 py-4 border-b border-zinc-100">
      <h2 class="text-sm font-semibold text-zinc-900">Localisation</h2>
    </div>
    <div class="p-6 grid sm:grid-cols-2 gap-4">

      {#if editing}
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Région viticole</label>
          <select bind:value={form.region} class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition bg-white">
            <option value="">— Sélectionner —</option>
            {#each REGIONS as r}
              <option value={r}>{r}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Département</label>
          <input bind:value={form.department} type="text" placeholder="ex: Gironde, Côte-d'Or…" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
        </div>
      {:else}
        {#each [
          ['Région viticole', $user?.region     || '—'],
          ['Département',     $user?.department || '—'],
        ] as [label, value]}
          <div class="space-y-1">
            <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</div>
            <div class="text-sm font-medium text-zinc-900">{value}</div>
          </div>
        {/each}
      {/if}

    </div>
  </div>

  <!-- ── Activité vendeur ─────────────────────────────────────────────── -->
  {#if isSeller || ($user?.role !== 'BUYER' && !editing)}
    {#if !editing && $user?.role === 'BUYER'}
      <!-- hide seller section for pure buyers in view mode -->
    {:else}
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
      <div class="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
        <h2 class="text-sm font-semibold text-zinc-900">Activité vendeur</h2>
        <span class="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">Vendeur</span>
      </div>
      <div class="p-6 space-y-5">

        {#if editing}
          <!-- Appellations -->
          <div class="space-y-2">
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Appellations</label>
            <div class="flex flex-wrap gap-2 mb-2">
              {#each form.appellations as tag, i}
                <span class="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 ring-1 ring-brand-200/60">
                  {tag}
                  <button type="button" on:click={() => form.appellations = removeTag(form.appellations, i)} class="text-brand-400 hover:text-brand-700">×</button>
                </span>
              {/each}
            </div>
            <input
              bind:value={appellationInput}
              type="text"
              placeholder="ex: Bordeaux, Pomerol… (Entrée pour ajouter)"
              on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (appellationInput.trim()) { form.appellations = addTag(form.appellations, appellationInput); appellationInput = ''; } } }}
              class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
            />
          </div>

          <!-- Cépages -->
          <div class="space-y-2">
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Cépages principaux</label>
            <div class="flex flex-wrap gap-2 mb-2">
              {#each form.grapeVarieties as tag, i}
                <span class="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1 ring-1 ring-violet-200/60">
                  {tag}
                  <button type="button" on:click={() => form.grapeVarieties = removeTag(form.grapeVarieties, i)} class="text-violet-400 hover:text-violet-700">×</button>
                </span>
              {/each}
            </div>
            <input
              bind:value={grapeInput}
              type="text"
              placeholder="ex: Merlot, Chardonnay… (Entrée pour ajouter)"
              on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (grapeInput.trim()) { form.grapeVarieties = addTag(form.grapeVarieties, grapeInput); grapeInput = ''; } } }}
              class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
            />
          </div>

          <!-- Surface & Volume -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Surface exploitée (ha)</label>
              <input bind:value={form.surfaceHa} type="number" min="0" step="0.1" placeholder="ex: 12.5" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Volume annuel moyen (hL)</label>
              <input bind:value={form.annualVolume} type="number" min="0" placeholder="ex: 500" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
            </div>
          </div>

        {:else}
          <!-- View mode -->
          <div class="space-y-4">
            {#if $user?.appellations?.length}
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Appellations</div>
                <div class="flex flex-wrap gap-2">
                  {#each $user.appellations as tag}
                    <span class="text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 ring-1 ring-brand-200/60">{tag}</span>
                  {/each}
                </div>
              </div>
            {/if}
            {#if $user?.grapeVarieties?.length}
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Cépages</div>
                <div class="flex flex-wrap gap-2">
                  {#each $user.grapeVarieties as tag}
                    <span class="text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1 ring-1 ring-violet-200/60">{tag}</span>
                  {/each}
                </div>
              </div>
            {/if}
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Surface (ha)</div>
                <div class="text-sm font-medium text-zinc-900 mt-1">{$user?.surfaceHa ?? '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Volume annuel (hL)</div>
                <div class="text-sm font-medium text-zinc-900 mt-1">{$user?.annualVolume ?? '—'}</div>
              </div>
            </div>
            {#if !$user?.appellations?.length && !$user?.grapeVarieties?.length && !$user?.surfaceHa && !$user?.annualVolume}
              <p class="text-sm text-zinc-400 italic">Aucune information renseignée</p>
            {/if}
          </div>
        {/if}

      </div>
    </div>
    {/if}
  {/if}

  <!-- ── Activité acheteur ────────────────────────────────────────────── -->
  {#if isBuyer || ($user?.role !== 'SELLER' && !editing)}
    {#if !editing && $user?.role === 'SELLER'}
      <!-- hide buyer section for pure sellers in view mode -->
    {:else}
    <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
      <div class="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
        <h2 class="text-sm font-semibold text-zinc-900">Activité acheteur</h2>
        <span class="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">Acheteur</span>
      </div>
      <div class="p-6 space-y-5">

        {#if editing}
          <!-- Produits recherchés -->
          <div class="space-y-2">
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Produits recherchés</label>
            <div class="flex flex-wrap gap-2 mb-2">
              {#each form.soughtProducts as tag, i}
                <span class="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 ring-1 ring-emerald-200/60">
                  {tag}
                  <button type="button" on:click={() => form.soughtProducts = removeTag(form.soughtProducts, i)} class="text-emerald-400 hover:text-emerald-700">×</button>
                </span>
              {/each}
            </div>
            <input
              bind:value={soughtInput}
              type="text"
              placeholder="ex: Raisin rouge, Moût… (Entrée pour ajouter)"
              on:keydown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (soughtInput.trim()) { form.soughtProducts = addTag(form.soughtProducts, soughtInput); soughtInput = ''; } } }}
              class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"
            />
          </div>

          <!-- Volume souhaité -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Volume souhaité</label>
            <input bind:value={form.soughtVolume} type="text" placeholder="ex: 200–500 hL/an" class="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-500 transition"/>
          </div>

        {:else}
          <div class="space-y-4">
            {#if $user?.soughtProducts?.length}
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Produits recherchés</div>
                <div class="flex flex-wrap gap-2">
                  {#each $user.soughtProducts as tag}
                    <span class="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 ring-1 ring-emerald-200/60">{tag}</span>
                  {/each}
                </div>
              </div>
            {/if}
            <div>
              <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Volume souhaité</div>
              <div class="text-sm font-medium text-zinc-900 mt-1">{$user?.soughtVolume || '—'}</div>
            </div>
            {#if !$user?.soughtProducts?.length && !$user?.soughtVolume}
              <p class="text-sm text-zinc-400 italic">Aucune information renseignée</p>
            {/if}
          </div>
        {/if}

      </div>
    </div>
    {/if}
  {/if}

  <!-- ── Compte ────────────────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-zinc-100">
      <h2 class="text-sm font-semibold text-zinc-900">Compte</h2>
    </div>
    <div class="divide-y divide-zinc-100">
      <div class="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-0.5">Adresse email</div>
          <div class="text-sm font-medium text-zinc-900">{$user?.email ?? '—'}</div>
        </div>
        <span class="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2.5 py-1">Non modifiable pour l'instant</span>
      </div>
      <div class="px-6 py-4">
        <button
          on:click={logout}
          class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  </div>

  {/if}
</div>
