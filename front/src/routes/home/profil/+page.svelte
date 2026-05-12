<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { AuthAPI } from '$lib/api/auth';
  import { UserAPI } from '$lib/api/user';
  import { EntrepriseAPI } from '$lib/api/entreprise';
  import { DocumentAPI } from '$lib/api/document';
  import type {
    UserRole,
    CompanyType,
    Entreprise,
    DocumentItem,
    DocumentType
  } from '$lib/types';

  let loading = true;
  let savingUser = false;
  let savingEntreprise = false;
  let uploadLoading = false;

  let editingUser = false;
  let editingEntreprise = false;

  let error = '';
  let success = '';

  let entreprise: Entreprise | null = null;
  let documents: DocumentItem[] = [];

  let userForm = {
    username: '',
    role: 'BUYER' as UserRole,
    firstName: '',
    lastName: '',
    phone: ''
  };

  let entrepriseForm = {
    name: '',
    type: '' as CompanyType | '',
    siren: '',
    siret: '',
    vatNumber: '',
    cviNumber: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    country: 'France',
    region: '',
    department: '',
    appellations: [] as string[],
    grapeVarieties: [] as string[],
    surfaceHa: '' as number | '',
    annualVolume: '' as number | '',
    soughtProducts: [] as string[],
    soughtVolume: ''
  };

  let appellationInput = '';
  let grapeInput = '';
  let soughtInput = '';

  let selectedFile: File | null = null;
  let selectedDocumentType: DocumentType = 'KBIS';
  let activeDocumentType: DocumentType = 'KBIS';

  $: selectedDocumentType = activeDocumentType;
  $: filteredDocuments = documents.filter((doc) => doc.type === activeDocumentType);
  $: activeDocumentLabel =
    DOCUMENT_TYPES.find((d) => d.value === activeDocumentType)?.label ?? 'Document';
  let documentLabel = '';

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

  const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
    { value: 'SELLER', label: 'Vendeur', desc: 'Je publie des offres de raisin, moût ou jus' },
    { value: 'BUYER', label: 'Acheteur', desc: 'Je recherche des produits viticoles' },
    { value: 'BOTH', label: 'Vendeur & Acheteur', desc: "Je vends et j'achète sur la plateforme" }
  ];

  const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'KBIS', label: 'Kbis' },
    { value: 'SIRENE_NOTICE', label: 'Avis Sirene' },
    { value: 'VAT_CERTIFICATE', label: 'Certificat TVA' },
    { value: 'RIB', label: 'RIB' },
    { value: 'CVI_CERTIFICATE', label: 'Justificatif CVI' },
    { value: 'IDENTITY_PROOF', label: "Pièce d'identité" },
    { value: 'OTHER', label: 'Autre' }
  ];

  $: isSeller = userForm.role === 'SELLER' || userForm.role === 'BOTH';
  $: isBuyer = userForm.role === 'BUYER' || userForm.role === 'BOTH';

  $: initials =
    (($user?.firstName?.[0] ?? '') + ($user?.lastName?.[0] ?? '')).toUpperCase() ||
    ($user?.username?.[0]?.toUpperCase() ?? 'U');

  $: roleLabel = ROLE_OPTIONS.find((r) => r.value === ($user?.role ?? 'BUYER'))?.label ?? '—';

  $: verificationLabel =
    entreprise?.status === 'VERIFIED'
      ? 'Entreprise vérifiée'
      : entreprise?.status === 'REJECTED'
        ? 'Vérification refusée'
        : entreprise?.status === 'PENDING'
          ? 'En cours de vérification'
          : 'Non vérifiée';

  $: verificationClass =
    entreprise?.status === 'VERIFIED'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
      : entreprise?.status === 'REJECTED'
        ? 'bg-rose-50 text-rose-700 ring-rose-200/60'
        : entreprise?.status === 'PENDING'
          ? 'bg-amber-50 text-amber-700 ring-amber-200/60'
          : 'bg-zinc-100 text-zinc-600 ring-zinc-200/60';

  onMount(async () => {
    await loadAll();
  });

  async function loadAll() {
    loading = true;
    error = '';

    try {
      const profileData = await UserAPI.getProfile();
      if (profileData.result) {
        user.setUser(profileData.result);
        hydrateUserForm(profileData.result);
      }

      const entrepriseData = await EntrepriseAPI.getMine();
      entreprise = entrepriseData.result ?? null;
      hydrateEntrepriseForm(entreprise);

      const docsData = await DocumentAPI.listEntrepriseDocuments();
      documents = docsData.result ?? [];
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors du chargement du profil.';
    } finally {
      loading = false;
    }
  }

  function hydrateUserForm(u: any) {
    userForm = {
      username: u?.username ?? '',
      role: u?.role ?? 'BUYER',
      firstName: u?.firstName ?? '',
      lastName: u?.lastName ?? '',
      phone: u?.phone ?? ''
    };
  }

  function hydrateEntrepriseForm(e: Entreprise | null) {
    entrepriseForm = {
      name: e?.name ?? '',
      type: e?.type ?? '',
      siren: e?.siren ?? '',
      siret: e?.siret ?? '',
      vatNumber: e?.vatNumber ?? '',
      cviNumber: e?.cviNumber ?? '',
      addressLine1: e?.addressLine1 ?? '',
      addressLine2: e?.addressLine2 ?? '',
      postalCode: e?.postalCode ?? '',
      city: e?.city ?? '',
      country: e?.country ?? 'France',
      region: e?.region ?? '',
      department: e?.department ?? '',
      appellations: [...(e?.appellations ?? [])],
      grapeVarieties: [...(e?.grapeVarieties ?? [])],
      surfaceHa: e?.surfaceHa ?? '',
      annualVolume: e?.annualVolume ?? '',
      soughtProducts: [...(e?.soughtProducts ?? [])],
      soughtVolume: e?.soughtVolume ?? ''
    };
  }

  function startEditUser() {
    hydrateUserForm($user);
    editingUser = true;
    error = '';
    success = '';
  }

  function cancelEditUser() {
    editingUser = false;
    error = '';
  }

  function startEditEntreprise() {
    hydrateEntrepriseForm(entreprise);
    editingEntreprise = true;
    error = '';
    success = '';
  }

  function cancelEditEntreprise() {
    editingEntreprise = false;
    error = '';
  }

  async function saveUser() {
    savingUser = true;
    error = '';
    success = '';

    try {
      await UserAPI.updateProfile(userForm);
      const profileData = await UserAPI.getProfile();
      if (profileData.result) {
        user.setUser(profileData.result);
      }
      editingUser = false;
      success = 'Informations personnelles enregistrées.';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.';
    } finally {
      savingUser = false;
    }
  }

  async function saveEntreprise() {
    savingEntreprise = true;
    error = '';
    success = '';

    try {
      await EntrepriseAPI.updateMine({
        ...entrepriseForm,
        type: entrepriseForm.type || undefined,
        surfaceHa: entrepriseForm.surfaceHa !== '' ? Number(entrepriseForm.surfaceHa) : undefined,
        annualVolume: entrepriseForm.annualVolume !== '' ? Number(entrepriseForm.annualVolume) : undefined
      });

      const entrepriseData = await EntrepriseAPI.getMine();
      entreprise = entrepriseData.result ?? null;
      hydrateEntrepriseForm(entreprise);

      const profileData = await UserAPI.getProfile();
      if (profileData.result) {
        user.setUser(profileData.result);
      }

      editingEntreprise = false;
      success = 'Informations entreprise enregistrées.';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.';
    } finally {
      savingEntreprise = false;
    }
  }

  async function uploadDocument() {
    if (!selectedFile) {
      error = 'Veuillez sélectionner un fichier.';
      return;
    }

    uploadLoading = true;
    error = '';
    success = '';

    try {
      await DocumentAPI.uploadEntrepriseDocument(selectedFile, selectedDocumentType, documentLabel);

      const docsData = await DocumentAPI.listEntrepriseDocuments();
      documents = docsData.result ?? [];

      const entrepriseData = await EntrepriseAPI.getMine();
      entreprise = entrepriseData.result ?? null;

      selectedFile = null;
      documentLabel = '';
      const fileInput = document.getElementById('document-upload') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';

      success = 'Document envoyé avec succès.';
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors de l'upload.";
    } finally {
      uploadLoading = false;
    }
  }

  async function deleteDocument(id: string) {
    error = '';
    success = '';

    try {
      await DocumentAPI.deleteDocument(id);
      const docsData = await DocumentAPI.listEntrepriseDocuments();
      documents = docsData.result ?? [];
      success = 'Document supprimé.';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erreur lors de la suppression.';
    }
  }

  function addTag(arr: string[], val: string) {
    const v = val.trim();
    if (v && !arr.includes(v)) return [...arr, v];
    return arr;
  }

  function removeTag(arr: string[], i: number) {
    return arr.filter((_, idx) => idx !== i);
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch {}
    user.clear();
    goto('/signIn');
  }

  function docTypeLabel(type: DocumentType) {
    return DOCUMENT_TYPES.find((d) => d.value === type)?.label ?? type;
  }

  function docStatusLabel(status: string) {
    if (status === 'APPROVED') return 'Approuvé';
    if (status === 'REJECTED') return 'Refusé';
    return 'En attente';
  }

  function docStatusClass(status: string) {
    if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60';
    if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 ring-rose-200/60';
    return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  }
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div class="flex items-center gap-2 text-sm text-zinc-400 mb-8">
    <a href="/home" class="hover:text-zinc-600 transition">Tableau de bord</a>
    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    </svg>
    <span class="text-zinc-600 font-medium">Mon profil</span>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-24 text-zinc-400 text-sm">Chargement…</div>
  {:else}
    <div class="space-y-6">
      <!-- Header -->
      <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-[0_20px_60px_rgba(31,13,54,0.06)]">
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-3xl bg-[rgb(var(--primary-50))] flex items-center justify-center ring-2 ring-[rgb(var(--primary-100))] shrink-0">
              <span class="text-2xl font-bold text-[rgb(var(--primary-700))]">{initials}</span>
            </div>

            <div>
              <h1 class="text-xl md:text-2xl font-semibold tracking-tight text-zinc-950">
                {[$user?.firstName, $user?.lastName].filter(Boolean).join(' ') || $user?.username || '—'}
              </h1>
              <p class="text-sm text-zinc-500 mt-1">{$user?.email ?? '—'}</p>

              <div class="mt-3 flex flex-wrap gap-2">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-800))] ring-[rgb(var(--primary-100))]">
                  {roleLabel}
                </span>

                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 {verificationClass}">
                  {verificationLabel}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button on:click={startEditUser} class="btn-secondary">
              Modifier mes infos
            </button>
            <button on:click={startEditEntreprise} class="btn-primary">
              Modifier l’entreprise
            </button>
          </div>
        </div>
      </div>

      {#if error}
        <div class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clip-rule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      {#if success}
        <div class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      {/if}

      <div class="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <!-- Infos personnelles -->
        <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 class="text-base font-semibold text-zinc-950">Informations personnelles</h2>
              <p class="text-sm text-zinc-500 mt-1">Votre identité et votre rôle sur la plateforme.</p>
            </div>
          </div>

          {#if editingUser}
            <div class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Prénom</label>
                  <input bind:value={userForm.firstName} type="text" class="input-soft" placeholder="Jean" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Nom</label>
                  <input bind:value={userForm.lastName} type="text" class="input-soft" placeholder="Dupont" />
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Nom d'utilisateur</label>
                  <input bind:value={userForm.username} type="text" class="input-soft" placeholder="jean.dupont" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Téléphone</label>
                  <input bind:value={userForm.phone} type="text" class="input-soft" placeholder="+33 6 00 00 00 00" />
                </div>
              </div>

              <div class="space-y-3">
                <label class="block text-sm font-medium text-zinc-800">Rôle</label>
                <div class="grid gap-3">
                  {#each ROLE_OPTIONS as opt}
                    <button
                      type="button"
                      on:click={() => (userForm.role = opt.value)}
                      class="rounded-2xl border p-4 text-left transition {userForm.role === opt.value
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}"
                    >
                      <div class="text-sm font-semibold text-zinc-950">{opt.label}</div>
                      <div class="text-xs text-zinc-500 mt-1">{opt.desc}</div>
                    </button>
                  {/each}
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button on:click={cancelEditUser} class="btn-secondary">Annuler</button>
                <button on:click={saveUser} disabled={savingUser} class="btn-primary">
                  {savingUser ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          {:else}
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Prénom</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{$user?.firstName || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nom</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{$user?.lastName || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nom d'utilisateur</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{$user?.username || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Téléphone</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{$user?.phone || '—'}</div>
              </div>
              <div class="sm:col-span-2">
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{$user?.email || '—'}</div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Entreprise -->
        <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-sm">
          <div class="mb-5">
            <h2 class="text-base font-semibold text-zinc-950">Entreprise</h2>
            <p class="text-sm text-zinc-500 mt-1">Informations légales et coordonnées de votre structure.</p>
          </div>

          {#if editingEntreprise}
            <div class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Nom de l’entreprise</label>
                  <input bind:value={entrepriseForm.name} type="text" class="input-soft" placeholder="Domaine de la Vigne" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Type de structure</label>
                  <select bind:value={entrepriseForm.type} class="input-soft">
                    <option value="">Sélectionner</option>
                    {#each COMPANY_TYPES as ct}
                      <option value={ct.value}>{ct.label}</option>
                    {/each}
                  </select>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">SIREN</label>
                  <input bind:value={entrepriseForm.siren} type="text" class="input-soft" placeholder="123456789" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">SIRET</label>
                  <input bind:value={entrepriseForm.siret} type="text" class="input-soft" placeholder="12345678900000" />
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Numéro TVA</label>
                  <input bind:value={entrepriseForm.vatNumber} type="text" class="input-soft" placeholder="FR..." />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Numéro CVI</label>
                  <input bind:value={entrepriseForm.cviNumber} type="text" class="input-soft" placeholder="Optionnel" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-zinc-800">Adresse</label>
                <input bind:value={entrepriseForm.addressLine1} type="text" class="input-soft" placeholder="Adresse principale" />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-zinc-800">Complément d’adresse</label>
                <input bind:value={entrepriseForm.addressLine2} type="text" class="input-soft" placeholder="Optionnel" />
              </div>

              <div class="grid sm:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Code postal</label>
                  <input bind:value={entrepriseForm.postalCode} type="text" class="input-soft" placeholder="33000" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Ville</label>
                  <input bind:value={entrepriseForm.city} type="text" class="input-soft" placeholder="Bordeaux" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Pays</label>
                  <input bind:value={entrepriseForm.country} type="text" class="input-soft" placeholder="France" />
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Région viticole</label>
                  <select bind:value={entrepriseForm.region} class="input-soft">
                    <option value="">Sélectionner</option>
                    {#each REGIONS as r}
                      <option value={r}>{r}</option>
                    {/each}
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Département</label>
                  <input bind:value={entrepriseForm.department} type="text" class="input-soft" placeholder="Gironde, Côte-d'Or..." />
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button on:click={cancelEditEntreprise} class="btn-secondary">Annuler</button>
                <button on:click={saveEntreprise} disabled={savingEntreprise} class="btn-primary">
                  {savingEntreprise ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          {:else}
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nom</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.name || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">
                  {COMPANY_TYPES.find((c) => c.value === entreprise?.type)?.label || '—'}
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">SIREN</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.siren || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">SIRET</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.siret || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">TVA</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.vatNumber || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">CVI</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.cviNumber || '—'}</div>
              </div>
              <div class="sm:col-span-2">
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Adresse</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">
                  {[entreprise?.addressLine1, entreprise?.addressLine2].filter(Boolean).join(', ') || '—'}
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Code postal</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.postalCode || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ville</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.city || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pays</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.country || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Région</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.region || '—'}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Département</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.department || '—'}</div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Activité -->
      <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-sm">
        <div class="mb-5">
          <h2 class="text-base font-semibold text-zinc-950">Activité métier</h2>
          <p class="text-sm text-zinc-500 mt-1">Renseignez votre activité pour améliorer la qualité des mises en relation.</p>
        </div>

        {#if editingEntreprise}
          <div class="space-y-6">
            {#if isSeller}
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-zinc-900">Activité vendeur</h3>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Appellations</label>
                  <div class="flex flex-wrap gap-2">
                    {#each entrepriseForm.appellations as tag, i}
                      <span class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                        {tag}
                        <button type="button" on:click={() => (entrepriseForm.appellations = removeTag(entrepriseForm.appellations, i))}>×</button>
                      </span>
                    {/each}
                  </div>
                  <input
                    bind:value={appellationInput}
                    type="text"
                    class="input-soft"
                    placeholder="Ex : Bordeaux, Pomerol... (Entrée pour ajouter)"
                    on:keydown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (appellationInput.trim()) {
                          entrepriseForm.appellations = addTag(entrepriseForm.appellations, appellationInput);
                          appellationInput = '';
                        }
                      }
                    }}
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Cépages</label>
                  <div class="flex flex-wrap gap-2">
                    {#each entrepriseForm.grapeVarieties as tag, i}
                      <span class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                        {tag}
                        <button type="button" on:click={() => (entrepriseForm.grapeVarieties = removeTag(entrepriseForm.grapeVarieties, i))}>×</button>
                      </span>
                    {/each}
                  </div>
                  <input
                    bind:value={grapeInput}
                    type="text"
                    class="input-soft"
                    placeholder="Ex : Merlot, Chardonnay... (Entrée pour ajouter)"
                    on:keydown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (grapeInput.trim()) {
                          entrepriseForm.grapeVarieties = addTag(entrepriseForm.grapeVarieties, grapeInput);
                          grapeInput = '';
                        }
                      }
                    }}
                  />
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-zinc-800">Surface (ha)</label>
                    <input bind:value={entrepriseForm.surfaceHa} type="number" min="0" step="0.1" class="input-soft" placeholder="12.5" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-zinc-800">Volume annuel (hL)</label>
                    <input bind:value={entrepriseForm.annualVolume} type="number" min="0" class="input-soft" placeholder="500" />
                  </div>
                </div>
              </div>
            {/if}

            {#if isBuyer}
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-zinc-900">Activité acheteur</h3>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Produits recherchés</label>
                  <div class="flex flex-wrap gap-2">
                    {#each entrepriseForm.soughtProducts as tag, i}
                      <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                        {tag}
                        <button type="button" on:click={() => (entrepriseForm.soughtProducts = removeTag(entrepriseForm.soughtProducts, i))}>×</button>
                      </span>
                    {/each}
                  </div>
                  <input
                    bind:value={soughtInput}
                    type="text"
                    class="input-soft"
                    placeholder="Ex : Raisin rouge, Moût... (Entrée pour ajouter)"
                    on:keydown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (soughtInput.trim()) {
                          entrepriseForm.soughtProducts = addTag(entrepriseForm.soughtProducts, soughtInput);
                          soughtInput = '';
                        }
                      }
                    }}
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-zinc-800">Volume souhaité</label>
                  <input bind:value={entrepriseForm.soughtVolume} type="text" class="input-soft" placeholder="200-500 hL/an" />
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="grid lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-zinc-900">Vendeur</h3>

              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Appellations</div>
                <div class="flex flex-wrap gap-2">
                  {#if entreprise?.appellations?.length}
                    {#each entreprise.appellations as tag}
                      <span class="text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1 ring-1 ring-violet-200/60">{tag}</span>
                    {/each}
                  {:else}
                    <span class="text-sm text-zinc-400">Aucune information</span>
                  {/if}
                </div>
              </div>

              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Cépages</div>
                <div class="flex flex-wrap gap-2">
                  {#if entreprise?.grapeVarieties?.length}
                    {#each entreprise.grapeVarieties as tag}
                      <span class="text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1 ring-1 ring-violet-200/60">{tag}</span>
                    {/each}
                  {:else}
                    <span class="text-sm text-zinc-400">Aucune information</span>
                  {/if}
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Surface</div>
                  <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.surfaceHa ?? '—'}</div>
                </div>
                <div>
                  <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Volume annuel</div>
                  <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.annualVolume ?? '—'}</div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-zinc-900">Acheteur</h3>

              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Produits recherchés</div>
                <div class="flex flex-wrap gap-2">
                  {#if entreprise?.soughtProducts?.length}
                    {#each entreprise.soughtProducts as tag}
                      <span class="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 ring-1 ring-emerald-200/60">{tag}</span>
                    {/each}
                  {:else}
                    <span class="text-sm text-zinc-400">Aucune information</span>
                  {/if}
                </div>
              </div>

              <div>
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider">Volume souhaité</div>
                <div class="mt-1 text-sm font-medium text-zinc-900">{entreprise?.soughtVolume || '—'}</div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Documents -->
      <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-sm">
        <div class="mb-5">
          <h2 class="text-base font-semibold text-zinc-950">Documents de vérification</h2>
          <p class="text-sm text-zinc-500 mt-1">
            Sélectionnez une catégorie pour consulter ou ajouter vos justificatifs.
          </p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          {#each DOCUMENT_TYPES as dt}
            <button
              type="button"
              on:click={() => (activeDocumentType = dt.value)}
              class="rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition
                {activeDocumentType === dt.value
                  ? 'bg-violet-600 text-white ring-violet-600 shadow-sm'
                  : 'bg-white text-zinc-600 ring-zinc-200 hover:bg-violet-50 hover:text-violet-700 hover:ring-violet-200'}"
            >
              {dt.label}
            </button>
          {/each}
        </div>

        <div class="grid xl:grid-cols-[380px_1fr] gap-6">
          <div class="rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 p-5">
            <div class="space-y-4">
              <div>
                <div class="text-sm font-semibold text-zinc-950">
                  Ajouter un document : {activeDocumentLabel}
                </div>
                <p class="mt-1 text-xs leading-5 text-zinc-500">
                  Formats acceptés : PDF, PNG, JPG, JPEG ou WEBP — 10 Mo max.
                </p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-zinc-800" for="documentLabel">
                  Libellé
                </label>
                <input
                  id="documentLabel"
                  bind:value={documentLabel}
                  type="text"
                  class="input-soft"
                  placeholder="Optionnel"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-zinc-800" for="document-upload">
                  Fichier
                </label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  class="block w-full text-sm text-zinc-600"
                  on:change={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    selectedFile = target.files?.[0] ?? null;
                  }}
                />
                <p class="text-xs text-zinc-400">
                  Vous pouvez envoyer un PDF ou une photo nette du document.
                </p>
              </div>

              <button on:click={uploadDocument} disabled={uploadLoading} class="btn-primary w-full">
                {uploadLoading ? 'Envoi...' : `Envoyer ${activeDocumentLabel}`}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-zinc-950">{activeDocumentLabel}</h3>
                <p class="text-xs text-zinc-500">
                  {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} dans cette catégorie
                </p>
              </div>
            </div>

            {#if filteredDocuments.length}
              {#each filteredDocuments as doc}
                <div class="rounded-3xl border border-zinc-200 bg-white p-4">
                  <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <h3 class="text-sm font-semibold text-zinc-950 truncate">
                          {doc.label || doc.originalName || activeDocumentLabel}
                        </h3>
                        <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 {docStatusClass(doc.status)}">
                          {docStatusLabel(doc.status)}
                        </span>
                      </div>

                      {#if doc.originalName}
                        <div class="mt-2 text-xs text-zinc-500 truncate">
                          {doc.originalName}
                        </div>
                      {/if}

                      {#if doc.comment}
                        <p class="mt-2 text-sm text-zinc-500">{doc.comment}</p>
                      {/if}

                      <div class="mt-3 text-xs text-zinc-400">
                        Ajouté le {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <a
                        href={`http://localhost:3000${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-secondary"
                      >
                        Voir
                      </a>

                      <button
                        on:click={() => deleteDocument(doc.id)}
                        class="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            {:else}
              <div class="rounded-3xl border border-zinc-200 bg-zinc-50/60 px-6 py-10 text-center">
                <div class="text-sm font-medium text-zinc-700">
                  Aucun document {activeDocumentLabel}
                </div>
                <div class="mt-1 text-sm text-zinc-500">
                  Ajoutez un document ou une photo claire dans cette catégorie.
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Compte -->
      <div class="rounded-[2rem] border border-[rgb(var(--border))] bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-base font-semibold text-zinc-950">Compte</h2>
            <p class="text-sm text-zinc-500 mt-1">Gérez votre session et les informations de base du compte.</p>
          </div>

          <button
            on:click={logout}
            class="inline-flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>