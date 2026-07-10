<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user';
  import { AuthAPI } from '$lib/api/auth';
  import { UserAPI } from '$lib/api/user';
  import { EntrepriseAPI } from '$lib/api/entreprise';
  import { DocumentAPI } from '$lib/api/document';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import { getProfileCompletion } from '$lib/utils/profileCompletion';
  import type {
    CompanyType,
    DocumentItem,
    DocumentType,
    Entreprise,
    User,
    UserRole
  } from '$lib/types';

  type TagField = 'appellations' | 'grapeVarieties' | 'soughtProducts';

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
    { value: 'SELLER', label: 'Vendeur', desc: 'Je publie des offres viticoles.' },
    { value: 'BUYER', label: 'Acheteur', desc: 'Je recherche des produits viticoles.' },
    { value: 'BOTH', label: 'Les deux', desc: "Je vends et j'achète sur VitiLink." }
  ];

  const DOCUMENT_TYPES: { value: DocumentType; label: string; hint: string }[] = [
    { value: 'KBIS', label: 'Kbis', hint: 'Justificatif légal de structure' },
    { value: 'SIRENE_NOTICE', label: 'Avis Sirene', hint: 'Avis de situation INSEE' },
    { value: 'VAT_CERTIFICATE', label: 'Certificat TVA', hint: 'Identité fiscale' },
    { value: 'RIB', label: 'RIB', hint: 'Coordonnées bancaires' },
    { value: 'CVI_CERTIFICATE', label: 'Justificatif CVI', hint: 'Référence viticole' },
    { value: 'IDENTITY_PROOF', label: "Pièce d'identité", hint: 'Identité du représentant' },
    { value: 'OTHER', label: 'Autre', hint: 'Document complémentaire' }
  ];

  const profileGuideSteps = [
    {
      id: 'identity',
      title: 'Identité',
      detail: 'Nom, rôle et contact',
      target: 'profile-personal',
      fields: ['username', 'firstName', 'lastName', 'phone']
    },
    {
      id: 'company',
      title: 'Entreprise',
      detail: 'Structure et repères légaux',
      target: 'profile-company',
      fields: ['companyName', 'companyType', 'legalId', 'city', 'region']
    },
    {
      id: 'activity',
      title: 'Activité',
      detail: 'Production et besoins',
      target: 'profile-activity',
      fields: ['activity']
    },
    {
      id: 'documents',
      title: 'Documents',
      detail: 'Justificatifs de confiance',
      target: 'profile-documents',
      fields: ['documents']
    }
  ];

  let loading = true;
  let savingUser = false;
  let savingEntreprise = false;
  let uploadLoading = false;
  let deletingDocumentId = '';
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
  let activeDocumentType: DocumentType = 'KBIS';
  let documentLabel = '';
  let selectedFile: File | null = null;

  $: currentUser = $user;
  $: initials = getInitials(currentUser);
  $: displayName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.username ||
    'Utilisateur';
  $: roleLabel = ROLE_OPTIONS.find((role) => role.value === (currentUser?.role ?? 'BUYER'))?.label ?? '—';
  $: isSeller = userForm.role === 'SELLER' || userForm.role === 'BOTH';
  $: isBuyer = userForm.role === 'BUYER' || userForm.role === 'BOTH';
  $: activeDocument = DOCUMENT_TYPES.find((doc) => doc.value === activeDocumentType) ?? DOCUMENT_TYPES[0];
  $: filteredDocuments = documents.filter((doc) => doc.type === activeDocumentType);
  $: completionState = getProfileCompletion(
    {
      username: userForm.username,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      phone: userForm.phone
    },
    {
      name: entrepriseForm.name,
      type: entrepriseForm.type || null,
      siren: entrepriseForm.siren,
      siret: entrepriseForm.siret,
      city: entrepriseForm.city,
      region: entrepriseForm.region,
      appellations: entrepriseForm.appellations,
      soughtProducts: entrepriseForm.soughtProducts
    },
    documents
  );
  $: completion = completionState.percent;
  $: verification = getVerification(entreprise);
  $: companyName = entreprise?.name || entrepriseForm.name || 'Entreprise à compléter';
  $: profileGuideFields = [
    { id: 'username', complete: Boolean(userForm.username.trim()) },
    { id: 'firstName', complete: Boolean(userForm.firstName.trim()) },
    { id: 'lastName', complete: Boolean(userForm.lastName.trim()) },
    { id: 'phone', complete: Boolean(userForm.phone.trim()) },
    { id: 'companyName', complete: Boolean(entrepriseForm.name.trim()) },
    { id: 'companyType', complete: Boolean(entrepriseForm.type) },
    { id: 'legalId', complete: Boolean(entrepriseForm.siren.trim() || entrepriseForm.siret.trim()) },
    { id: 'city', complete: Boolean(entrepriseForm.city.trim()) },
    { id: 'region', complete: Boolean(entrepriseForm.region) },
    {
      id: 'activity',
      complete: Boolean(entrepriseForm.appellations.length || entrepriseForm.soughtProducts.length)
    },
    { id: 'documents', complete: documents.length > 0 }
  ];
  $: profileCompletedFields = profileGuideFields.filter((field) => field.complete).length;
  $: profileGuidePercent = Math.round((profileCompletedFields / profileGuideFields.length) * 100);

  onMount(loadAll);

  async function loadAll() {
    loading = true;
    error = '';

    try {
      const [profileData, entrepriseData, docsData] = await Promise.all([
        UserAPI.getProfile(),
        EntrepriseAPI.getMine(),
        DocumentAPI.listEntrepriseDocuments()
      ]);

      if (profileData.result) {
        user.setUser(profileData.result);
        hydrateUserForm(profileData.result);
      }

      entreprise = entrepriseData.result ?? null;
      hydrateEntrepriseForm(entreprise);
      documents = docsData.result ?? [];
    } catch (e) {
      error = getErrorMessage(e, 'Erreur lors du chargement du profil.');
    } finally {
      loading = false;
    }
  }

  function hydrateUserForm(value: User | null) {
    userForm = {
      username: value?.username ?? '',
      role: value?.role ?? 'BUYER',
      firstName: value?.firstName ?? '',
      lastName: value?.lastName ?? '',
      phone: value?.phone ?? ''
    };
  }

  function hydrateEntrepriseForm(value: Entreprise | null) {
    entrepriseForm = {
      name: value?.name ?? '',
      type: value?.type ?? '',
      siren: value?.siren ?? '',
      siret: value?.siret ?? '',
      vatNumber: value?.vatNumber ?? '',
      cviNumber: value?.cviNumber ?? '',
      addressLine1: value?.addressLine1 ?? '',
      addressLine2: value?.addressLine2 ?? '',
      postalCode: value?.postalCode ?? '',
      city: value?.city ?? '',
      country: value?.country ?? 'France',
      region: value?.region ?? '',
      department: value?.department ?? '',
      appellations: [...(value?.appellations ?? [])],
      grapeVarieties: [...(value?.grapeVarieties ?? [])],
      surfaceHa: value?.surfaceHa ?? '',
      annualVolume: value?.annualVolume ?? '',
      soughtProducts: [...(value?.soughtProducts ?? [])],
      soughtVolume: value?.soughtVolume ?? ''
    };
  }

  async function saveUser() {
    savingUser = true;
    clearMessages();

    try {
      await UserAPI.updateProfile({
        username: cleanOptional(userForm.username),
        role: userForm.role,
        firstName: cleanNullable(userForm.firstName),
        lastName: cleanNullable(userForm.lastName),
        phone: cleanNullable(userForm.phone)
      });

      const profileData = await UserAPI.getProfile();
      if (profileData.result) {
        user.setUser(profileData.result);
        hydrateUserForm(profileData.result);
      }

      success = 'Informations personnelles enregistrées.';
    } catch (e) {
      error = getErrorMessage(e, 'Erreur lors de la sauvegarde des informations personnelles.');
    } finally {
      savingUser = false;
    }
  }

  async function saveEntreprise() {
    savingEntreprise = true;
    clearMessages();
    flushPendingTags();

    try {
      await EntrepriseAPI.updateMine(buildEntreprisePayload());
      const [entrepriseData, profileData] = await Promise.all([
        EntrepriseAPI.getMine(),
        UserAPI.getProfile()
      ]);

      entreprise = entrepriseData.result ?? null;
      hydrateEntrepriseForm(entreprise);

      if (profileData.result) {
        user.setUser(profileData.result);
      }

      success = 'Informations entreprise enregistrées.';
    } catch (e) {
      error = getErrorMessage(e, "Erreur lors de la sauvegarde de l'entreprise.");
    } finally {
      savingEntreprise = false;
    }
  }

  async function uploadDocument() {
    if (!selectedFile) {
      error = 'Veuillez sélectionner un fichier.';
      success = '';
      return;
    }

    uploadLoading = true;
    clearMessages();

    try {
      await DocumentAPI.uploadEntrepriseDocument(selectedFile, activeDocumentType, documentLabel.trim());
      const [docsData, entrepriseData, profileData] = await Promise.all([
        DocumentAPI.listEntrepriseDocuments(),
        EntrepriseAPI.getMine(),
        UserAPI.getProfile()
      ]);

      documents = docsData.result ?? [];
      entreprise = entrepriseData.result ?? null;
      hydrateEntrepriseForm(entreprise);

      if (profileData.result) {
        user.setUser(profileData.result);
      }

      selectedFile = null;
      documentLabel = '';
      resetFileInput();
      success = 'Document envoyé avec succès.';
    } catch (e) {
      error = getErrorMessage(e, "Erreur lors de l'envoi du document.");
    } finally {
      uploadLoading = false;
    }
  }

  async function deleteDocument(id: string) {
    deletingDocumentId = id;
    clearMessages();

    try {
      await DocumentAPI.deleteDocument(id);
      const docsData = await DocumentAPI.listEntrepriseDocuments();
      documents = docsData.result ?? [];
      success = 'Document supprimé.';
    } catch (e) {
      error = getErrorMessage(e, 'Erreur lors de la suppression du document.');
    } finally {
      deletingDocumentId = '';
    }
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch {}

    user.clear();
    goto('/signIn');
  }

  function buildEntreprisePayload() {
    return {
      name: cleanNullable(entrepriseForm.name),
      type: entrepriseForm.type || undefined,
      siren: cleanNullable(entrepriseForm.siren),
      siret: cleanNullable(entrepriseForm.siret),
      vatNumber: cleanNullable(entrepriseForm.vatNumber),
      cviNumber: cleanNullable(entrepriseForm.cviNumber),
      addressLine1: cleanNullable(entrepriseForm.addressLine1),
      addressLine2: cleanNullable(entrepriseForm.addressLine2),
      postalCode: cleanNullable(entrepriseForm.postalCode),
      city: cleanNullable(entrepriseForm.city),
      country: cleanNullable(entrepriseForm.country) || 'France',
      region: cleanNullable(entrepriseForm.region),
      department: cleanNullable(entrepriseForm.department),
      appellations: entrepriseForm.appellations,
      grapeVarieties: entrepriseForm.grapeVarieties,
      surfaceHa: numberOrNull(entrepriseForm.surfaceHa),
      annualVolume: numberOrNull(entrepriseForm.annualVolume),
      soughtProducts: entrepriseForm.soughtProducts,
      soughtVolume: cleanNullable(entrepriseForm.soughtVolume)
    };
  }

  function addTag(field: TagField, value: string) {
    const cleaned = value.trim();
    if (!cleaned || entrepriseForm[field].includes(cleaned)) return;
    entrepriseForm[field] = [...entrepriseForm[field], cleaned];
  }

  function removeTag(field: TagField, index: number) {
    entrepriseForm[field] = entrepriseForm[field].filter((_, i) => i !== index);
  }

  function handleTagKeydown(event: KeyboardEvent, field: TagField) {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();

    if (field === 'appellations') {
      addTag(field, appellationInput);
      appellationInput = '';
    }

    if (field === 'grapeVarieties') {
      addTag(field, grapeInput);
      grapeInput = '';
    }

    if (field === 'soughtProducts') {
      addTag(field, soughtInput);
      soughtInput = '';
    }
  }

  function flushPendingTags() {
    if (appellationInput.trim()) {
      addTag('appellations', appellationInput);
      appellationInput = '';
    }

    if (grapeInput.trim()) {
      addTag('grapeVarieties', grapeInput);
      grapeInput = '';
    }

    if (soughtInput.trim()) {
      addTag('soughtProducts', soughtInput);
      soughtInput = '';
    }
  }

  function resetFileInput() {
    const input = document.getElementById('document-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  function clearMessages() {
    error = '';
    success = '';
  }

  function cleanOptional(value: string) {
    const cleaned = value.trim();
    return cleaned || undefined;
  }

  function cleanNullable(value: string) {
    const cleaned = value.trim();
    return cleaned || null;
  }

  function numberOrNull(value: number | '') {
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function keepDigits(value: string, maxLength: number) {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }

  function getInitials(value: User | null) {
    const letters = `${value?.firstName?.[0] ?? ''}${value?.lastName?.[0] ?? ''}`.toUpperCase();
    return letters || value?.username?.[0]?.toUpperCase() || 'U';
  }

  function getVerification(value: Entreprise | null) {
    if (value?.status === 'VERIFIED') {
      return {
        label: 'Entreprise vérifiée',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
      };
    }

    if (value?.status === 'REJECTED') {
      return {
        label: 'Vérification refusée',
        className: 'bg-rose-50 text-rose-700 ring-rose-200/60'
      };
    }

    return {
      label: value ? 'En cours de vérification' : 'Entreprise à créer',
      className: 'bg-amber-50 text-amber-700 ring-amber-200/60'
    };
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

  function getErrorMessage(e: unknown, fallback: string) {
    return e instanceof Error ? e.message : fallback;
  }

  function isProfileStepComplete(id: string) {
    const step = profileGuideSteps.find((item) => item.id === id);
    if (!step) return false;
    return getProfileStepCompletedCount(step) === step.fields.length;
  }

  function getProfileStepCompletedCount(step: (typeof profileGuideSteps)[number]) {
    return step.fields.filter((id) => profileGuideFields.some((field) => field.id === id && field.complete)).length;
  }

  function scrollToProfileSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<svelte:head>
  <title>Mon profil - VitiLink</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
  {#if loading}
    <LoadingState
      title="Chargement du profil"
      text="Nous récupérons vos informations personnelles, votre entreprise et vos documents."
    />
  {:else}
    <nav class="mb-5 flex items-center gap-2 text-sm text-zinc-500">
      <a href="/dashboard" class="font-medium text-violet-800 transition hover:text-violet-950">Tableau de bord</a>
      <span>/</span>
      <span class="text-zinc-700">Mon profil</span>
    </nav>

    <section class="relative isolate overflow-hidden rounded-lg border border-white bg-[#24152f] shadow-[0_28px_80px_rgba(36,21,47,0.16)]">
      <img src="/assets/images/header.jpg" alt="" class="absolute inset-0 -z-20 h-full w-full object-cover opacity-70" />
      <div class="absolute inset-0 -z-10 bg-[linear-gradient(110deg,#24152f_0%,rgba(36,21,47,0.92)_48%,rgba(91,45,242,0.34)_100%)]"></div>

      <div class="grid gap-6 px-5 py-7 text-white sm:px-7 sm:py-8 lg:grid-cols-[1fr_420px] lg:px-9">
        <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div class="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-white/14 text-3xl font-semibold ring-1 ring-white/20 backdrop-blur">
            {initials}
          </div>

          <div class="min-w-0">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              Profil professionnel
            </div>
            <h1 class="mt-4 truncate text-3xl font-semibold tracking-tight sm:text-4xl">{displayName}</h1>
            <p class="mt-2 truncate text-sm text-white/70">{currentUser?.email ?? 'Compte VitiLink'}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#24152f]">{roleLabel}</span>
              <span class={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${verification.className}`}>{verification.label}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-3xl font-semibold">{completion}%</div>
            <div class="mt-1 text-sm font-semibold">Profil complété</div>
            <div class="mt-2 text-xs leading-5 text-white/60">Infos, activité et documents</div>
          </article>
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="text-3xl font-semibold">{documents.length}</div>
            <div class="mt-1 text-sm font-semibold">Documents</div>
            <div class="mt-2 text-xs leading-5 text-white/60">Justificatifs enregistrés</div>
          </article>
          <article class="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div class="truncate text-3xl font-semibold">{entreprise?.city || '—'}</div>
            <div class="mt-1 text-sm font-semibold">Ancrage</div>
            <div class="mt-2 text-xs leading-5 text-white/60">{entreprise?.region || 'Région à compléter'}</div>
          </article>
        </div>
      </div>
    </section>

    {#if error}
      <div class="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
        {success}
      </div>
    {/if}

    <div class="mt-6 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="min-h-0 space-y-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
        <section class="overflow-hidden rounded-[1.5rem] bg-[#181121] text-white shadow-[0_24px_70px_rgba(24,17,33,0.22)]">
          <div class="relative isolate px-5 py-5">
            <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(139,92,246,0.45),transparent_36%),radial-gradient(circle_at_96%_18%,rgba(34,197,94,0.20),transparent_30%)]"></div>

            <div class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              Fil conducteur
            </div>

            <div class="mt-4">
              <div class="flex items-end justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Profil complété</p>
                  <p class="mt-1 text-2xl font-semibold">{profileGuidePercent}%</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-right">
                  <p class="text-xs text-white/55">Champs</p>
                  <p class="text-sm font-semibold">{profileCompletedFields}/{profileGuideFields.length}</p>
                </div>
              </div>
              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300 transition-all duration-500" style={`width: ${profileGuidePercent}%`}></div>
              </div>
            </div>

            <div class="mt-5 space-y-3">
              {#each profileGuideSteps as step, index}
                <button type="button" class="group relative flex w-full gap-3 text-left" on:click={() => scrollToProfileSection(step.target)}>
                  {#if index < profileGuideSteps.length - 1}
                    <span class="absolute left-3.5 top-8 h-[calc(100%-0.125rem)] w-px bg-white/15"></span>
                  {/if}
                  <span
                    class={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition ${
                      isProfileStepComplete(step.id)
                        ? 'bg-emerald-300 text-[#181121]'
                        : 'border border-white/15 bg-white/10 text-white/70 group-hover:bg-white/15'
                    }`}
                  >
                    {isProfileStepComplete(step.id) ? '✓' : index + 1}
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-semibold text-white">{step.title}</span>
                    <span class="mt-0.5 block text-xs leading-5 text-white/55">{step.detail}</span>
                  </span>
                </button>
              {/each}
            </div>
          </div>

          <div class="border-t border-white/10 bg-white/[0.06] px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Entreprise</p>
            <h3 class="mt-2 break-words text-base font-semibold leading-tight">{companyName}</h3>
            <div class="mt-3 grid gap-2">
              <div class="rounded-xl bg-white/10 px-3 py-2">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Statut</div>
                <div class="mt-1 text-sm font-semibold text-white/80">{verification.label}</div>
              </div>
              <div class="rounded-xl bg-white/10 px-3 py-2">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Type</div>
                <div class="mt-1 text-sm font-semibold text-white/80">
                  {COMPANY_TYPES.find((item) => item.value === (entrepriseForm.type || entreprise?.type))?.label || 'À compléter'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[1.25rem] border border-violet-200 bg-violet-50 px-4 py-3">
          <div class="text-sm font-semibold text-[#24152f]">Tips</div>
          <p class="mt-1 text-xs leading-5 text-violet-950/70">
            Les champs vides restent acceptés. Pour SIREN/SIRET, utilisez uniquement des chiffres.
          </p>
        </section>
      </aside>

      <div class="space-y-6">
        <section id="profile-personal" class="scroll-mt-28 rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex flex-col gap-2 border-b border-violet-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#24152f]">Informations personnelles</h2>
              <p class="mt-1 text-sm text-zinc-500">Identité, rôle et coordonnées visibles dans votre espace.</p>
            </div>
            <button type="button" on:click={saveUser} disabled={savingUser} class="btn-primary shrink-0 disabled:opacity-60">
              {savingUser ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <label class="block space-y-2" for="profile-first-name">
              <span class="text-sm font-medium text-zinc-800">Prénom</span>
              <input id="profile-first-name" bind:value={userForm.firstName} type="text" class="input-soft" placeholder="Jean" />
            </label>
            <label class="block space-y-2" for="profile-last-name">
              <span class="text-sm font-medium text-zinc-800">Nom</span>
              <input id="profile-last-name" bind:value={userForm.lastName} type="text" class="input-soft" placeholder="Dupont" />
            </label>
            <label class="block space-y-2" for="profile-username">
              <span class="text-sm font-medium text-zinc-800">Nom d'utilisateur</span>
              <input id="profile-username" bind:value={userForm.username} type="text" class="input-soft" placeholder="jean.dupont" />
            </label>
            <label class="block space-y-2" for="profile-phone">
              <span class="text-sm font-medium text-zinc-800">Téléphone</span>
              <input id="profile-phone" bind:value={userForm.phone} type="text" class="input-soft" placeholder="+33 6 00 00 00 00" />
            </label>
          </div>

          <fieldset class="mt-5">
            <legend class="text-sm font-medium text-zinc-800">Rôle principal</legend>
            <div class="mt-3 grid gap-3 md:grid-cols-3">
              {#each ROLE_OPTIONS as option}
                <button
                  type="button"
                  on:click={() => (userForm.role = option.value)}
                  class={`rounded-lg border p-4 text-left transition ${
                    userForm.role === option.value
                      ? 'border-violet-300 bg-violet-50 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-violet-200 hover:bg-violet-50/60'
                  }`}
                >
                  <span class="block text-sm font-semibold text-[#24152f]">{option.label}</span>
                  <span class="mt-1 block text-xs leading-5 text-zinc-500">{option.desc}</span>
                </button>
              {/each}
            </div>
          </fieldset>
        </section>

        <section id="profile-company" class="scroll-mt-28 rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex flex-col gap-2 border-b border-violet-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#24152f]">Entreprise</h2>
              <p class="mt-1 text-sm text-zinc-500">Informations légales et adresse professionnelle.</p>
            </div>
            <button type="button" on:click={saveEntreprise} disabled={savingEntreprise} class="btn-primary shrink-0 disabled:opacity-60">
              {savingEntreprise ? 'Enregistrement...' : "Enregistrer l'entreprise"}
            </button>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <label class="block space-y-2" for="company-name">
              <span class="text-sm font-medium text-zinc-800">Nom de l'entreprise</span>
              <input id="company-name" bind:value={entrepriseForm.name} type="text" class="input-soft" placeholder="Domaine de la Vigne" />
            </label>
            <label class="block space-y-2" for="company-type">
              <span class="text-sm font-medium text-zinc-800">Type de structure</span>
              <select id="company-type" bind:value={entrepriseForm.type} class="input-soft">
                <option value="">Sélectionner</option>
                {#each COMPANY_TYPES as companyType}
                  <option value={companyType.value}>{companyType.label}</option>
                {/each}
              </select>
            </label>
            <label class="block space-y-2" for="company-siren">
              <span class="text-sm font-medium text-zinc-800">SIREN</span>
              <input
                id="company-siren"
                bind:value={entrepriseForm.siren}
                type="text"
                inputmode="numeric"
                maxlength="9"
                pattern="[0-9]{9}"
                title="Le SIREN doit contenir exactement 9 chiffres."
                class="input-soft"
                placeholder="123456789"
                on:input={(event) => (entrepriseForm.siren = keepDigits((event.currentTarget as HTMLInputElement).value, 9))}
              />
              <span class="block text-xs leading-5 text-zinc-500">
                <span class="font-semibold text-violet-700">*</span> 9 chiffres, sans espaces ni lettres.
              </span>
            </label>
            <label class="block space-y-2" for="company-siret">
              <span class="text-sm font-medium text-zinc-800">SIRET</span>
              <input
                id="company-siret"
                bind:value={entrepriseForm.siret}
                type="text"
                inputmode="numeric"
                maxlength="14"
                pattern="[0-9]{14}"
                title="Le SIRET doit contenir exactement 14 chiffres."
                class="input-soft"
                placeholder="12345678900000"
                on:input={(event) => (entrepriseForm.siret = keepDigits((event.currentTarget as HTMLInputElement).value, 14))}
              />
              <span class="block text-xs leading-5 text-zinc-500">
                <span class="font-semibold text-violet-700">*</span> 14 chiffres, correspond au SIREN + établissement.
              </span>
            </label>
            <label class="block space-y-2" for="company-vat">
              <span class="text-sm font-medium text-zinc-800">Numéro TVA</span>
              <input id="company-vat" bind:value={entrepriseForm.vatNumber} type="text" class="input-soft" placeholder="FR..." />
            </label>
            <label class="block space-y-2" for="company-cvi">
              <span class="text-sm font-medium text-zinc-800">Numéro CVI</span>
              <input id="company-cvi" bind:value={entrepriseForm.cviNumber} type="text" class="input-soft" placeholder="Optionnel" />
            </label>
            <label class="block space-y-2 sm:col-span-2" for="company-address-1">
              <span class="text-sm font-medium text-zinc-800">Adresse</span>
              <input id="company-address-1" bind:value={entrepriseForm.addressLine1} type="text" class="input-soft" placeholder="Adresse principale" />
            </label>
            <label class="block space-y-2 sm:col-span-2" for="company-address-2">
              <span class="text-sm font-medium text-zinc-800">Complément d'adresse</span>
              <input id="company-address-2" bind:value={entrepriseForm.addressLine2} type="text" class="input-soft" placeholder="Optionnel" />
            </label>
            <label class="block space-y-2" for="company-postal-code">
              <span class="text-sm font-medium text-zinc-800">Code postal</span>
              <input id="company-postal-code" bind:value={entrepriseForm.postalCode} type="text" class="input-soft" placeholder="33000" />
            </label>
            <label class="block space-y-2" for="company-city">
              <span class="text-sm font-medium text-zinc-800">Ville</span>
              <input id="company-city" bind:value={entrepriseForm.city} type="text" class="input-soft" placeholder="Bordeaux" />
            </label>
            <label class="block space-y-2" for="company-country">
              <span class="text-sm font-medium text-zinc-800">Pays</span>
              <input id="company-country" bind:value={entrepriseForm.country} type="text" class="input-soft" placeholder="France" />
            </label>
            <label class="block space-y-2" for="company-region">
              <span class="text-sm font-medium text-zinc-800">Région viticole</span>
              <select id="company-region" bind:value={entrepriseForm.region} class="input-soft">
                <option value="">Sélectionner</option>
                {#each REGIONS as region}
                  <option value={region}>{region}</option>
                {/each}
              </select>
            </label>
            <label class="block space-y-2" for="company-department">
              <span class="text-sm font-medium text-zinc-800">Département</span>
              <input id="company-department" bind:value={entrepriseForm.department} type="text" class="input-soft" placeholder="Gironde, Côte-d'Or..." />
            </label>
          </div>
        </section>

        <section id="profile-activity" class="scroll-mt-28 rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="border-b border-violet-100 pb-5">
            <h2 class="text-lg font-semibold text-[#24152f]">Activité métier</h2>
            <p class="mt-1 text-sm text-zinc-500">Ces champs améliorent la mise en relation entre professionnels.</p>
          </div>

          <div class="mt-5 grid gap-6 lg:grid-cols-2">
            {#if isSeller}
              <div class="space-y-5">
                <div>
                  <h3 class="text-sm font-semibold text-[#24152f]">Activité vendeur</h3>
                  <p class="mt-1 text-sm text-zinc-500">Appellations, cépages et capacité de production.</p>
                </div>

                <div class="space-y-3">
                  <label class="block text-sm font-medium text-zinc-800" for="company-appellations">Appellations</label>
                  {@render TagList(entrepriseForm.appellations, 'appellations', 'violet')}
                  <input id="company-appellations" bind:value={appellationInput} type="text" class="input-soft" placeholder="Bordeaux, Pomerol..." on:keydown={(event) => handleTagKeydown(event, 'appellations')} />
                </div>

                <div class="space-y-3">
                  <label class="block text-sm font-medium text-zinc-800" for="company-grapes">Cépages</label>
                  {@render TagList(entrepriseForm.grapeVarieties, 'grapeVarieties', 'violet')}
                  <input id="company-grapes" bind:value={grapeInput} type="text" class="input-soft" placeholder="Merlot, Chardonnay..." on:keydown={(event) => handleTagKeydown(event, 'grapeVarieties')} />
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="block space-y-2" for="company-surface">
                    <span class="text-sm font-medium text-zinc-800">Surface (ha)</span>
                    <input id="company-surface" bind:value={entrepriseForm.surfaceHa} type="number" min="0" step="0.1" class="input-soft" placeholder="12.5" />
                  </label>
                  <label class="block space-y-2" for="company-annual-volume">
                    <span class="text-sm font-medium text-zinc-800">Volume annuel (hL)</span>
                    <input id="company-annual-volume" bind:value={entrepriseForm.annualVolume} type="number" min="0" class="input-soft" placeholder="500" />
                  </label>
                </div>
              </div>
            {/if}

            {#if isBuyer}
              <div class="space-y-5">
                <div>
                  <h3 class="text-sm font-semibold text-[#24152f]">Activité acheteur</h3>
                  <p class="mt-1 text-sm text-zinc-500">Produits recherchés et volume cible.</p>
                </div>

                <div class="space-y-3">
                  <label class="block text-sm font-medium text-zinc-800" for="company-sought-products">Produits recherchés</label>
                  {@render TagList(entrepriseForm.soughtProducts, 'soughtProducts', 'emerald')}
                  <input id="company-sought-products" bind:value={soughtInput} type="text" class="input-soft" placeholder="Raisin rouge, moût..." on:keydown={(event) => handleTagKeydown(event, 'soughtProducts')} />
                </div>

                <label class="block space-y-2" for="company-sought-volume">
                  <span class="text-sm font-medium text-zinc-800">Volume souhaité</span>
                  <input id="company-sought-volume" bind:value={entrepriseForm.soughtVolume} type="text" class="input-soft" placeholder="200-500 hL/an" />
                </label>
              </div>
            {/if}
          </div>

          <div class="mt-6 flex justify-end border-t border-violet-100 pt-5">
            <button type="button" on:click={saveEntreprise} disabled={savingEntreprise} class="btn-primary disabled:opacity-60">
              {savingEntreprise ? 'Enregistrement...' : "Enregistrer l'activité"}
            </button>
          </div>
        </section>

        <section id="profile-documents" class="scroll-mt-28 rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex flex-col gap-2 border-b border-violet-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#24152f]">Documents de vérification</h2>
              <p class="mt-1 text-sm text-zinc-500">Ajoutez les justificatifs utiles à la validation de votre entreprise.</p>
            </div>
            <span class="rounded-full bg-[#fbfaf8] px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </span>
          </div>

          <div class="mt-5 grid gap-6 xl:grid-cols-[330px_1fr]">
            <div class="rounded-lg bg-violet-50 p-4 ring-1 ring-violet-100">
              <div class="grid gap-2">
                {#each DOCUMENT_TYPES as docType}
                  <button
                    type="button"
                    on:click={() => (activeDocumentType = docType.value)}
                    class={`rounded-lg px-3 py-2.5 text-left transition ${
                      activeDocumentType === docType.value
                        ? 'bg-[#24152f] text-white shadow-sm'
                        : 'bg-white text-zinc-700 ring-1 ring-violet-100 hover:bg-violet-50'
                    }`}
                  >
                    <span class="block text-sm font-semibold">{docType.label}</span>
                    <span class={`mt-0.5 block text-xs ${activeDocumentType === docType.value ? 'text-white/65' : 'text-zinc-500'}`}>{docType.hint}</span>
                  </button>
                {/each}
              </div>
            </div>

            <div class="space-y-5">
              <div class="rounded-lg border border-dashed border-violet-200 bg-[#fbfaf8] p-4">
                <div class="grid gap-4">
                  <label class="block space-y-2" for="document-label">
                    <span class="text-sm font-medium text-zinc-800">Libellé</span>
                    <input id="document-label" bind:value={documentLabel} type="text" class="input-soft" placeholder="Optionnel" />
                  </label>

                  <div class="space-y-2">
                    <span class="block text-sm font-medium text-zinc-800">Fichier</span>
                    <input
                      id="document-upload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      class="sr-only"
                      on:change={(event) => {
                        const target = event.currentTarget as HTMLInputElement;
                        selectedFile = target.files?.[0] ?? null;
                      }}
                    />
                    <label
                      for="document-upload"
                      class="flex min-h-14 w-full cursor-pointer flex-col gap-3 rounded-lg border border-violet-100 bg-white p-3 text-sm transition hover:border-violet-200 hover:bg-violet-50/50 sm:flex-row sm:items-center"
                    >
                      <span class="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#24152f] px-4 py-2.5 text-sm font-semibold text-white">
                        Choisir un fichier
                      </span>
                      <span class={`min-w-0 flex-1 truncate ${selectedFile ? 'font-medium text-[#24152f]' : 'text-zinc-500'}`}>
                        {selectedFile?.name ?? 'Aucun fichier sélectionné'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <button type="button" on:click={uploadDocument} disabled={uploadLoading} class="btn-primary w-full disabled:opacity-60 sm:w-auto">
                      {uploadLoading ? 'Envoi...' : `Envoyer ${activeDocument.label}`}
                    </button>
                  </div>
                </div>
                <p class="mt-3 text-xs leading-5 text-zinc-500">PDF, PNG, JPG, JPEG ou WEBP, 10 Mo maximum. Si aucune entreprise n'existe encore, elle sera créée automatiquement.</p>
              </div>

              <div>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <h3 class="text-sm font-semibold text-[#24152f]">{activeDocument.label}</h3>
                    <p class="mt-1 text-xs text-zinc-500">
                      {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} dans cette catégorie
                    </p>
                  </div>
                </div>

                {#if filteredDocuments.length}
                  <div class="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100">
                    {#each filteredDocuments as doc}
                      <article class="flex flex-col gap-4 bg-white px-4 py-4 md:flex-row md:items-start md:justify-between">
                        <div class="min-w-0">
                          <div class="flex flex-wrap items-center gap-2">
                            <h4 class="truncate text-sm font-semibold text-[#24152f]">{doc.label || doc.originalName || activeDocument.label}</h4>
                            <span class={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${docStatusClass(doc.status)}`}>
                              {docStatusLabel(doc.status)}
                            </span>
                          </div>
                          {#if doc.originalName}
                            <p class="mt-2 truncate text-xs text-zinc-500">{doc.originalName}</p>
                          {/if}
                          {#if doc.comment}
                            <p class="mt-2 text-sm leading-6 text-zinc-500">{doc.comment}</p>
                          {/if}
                          <p class="mt-3 text-xs text-zinc-400">
                            Ajouté le {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </p>
                        </div>

                        <div class="flex shrink-0 gap-2">
                          <a href={DocumentAPI.fileUrl(doc.url)} target="_blank" rel="noopener noreferrer" class="btn-secondary">Voir</a>
                          <button
                            type="button"
                            on:click={() => deleteDocument(doc.id)}
                            disabled={deletingDocumentId === doc.id}
                            class="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            {deletingDocumentId === doc.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      </article>
                    {/each}
                  </div>
                {:else}
                  <div class="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-6 py-10 text-center">
                    <p class="text-sm font-semibold text-[#24152f]">Aucun document {activeDocument.label}</p>
                    <p class="mt-2 text-sm text-zinc-500">Ajoutez un justificatif dans cette catégorie pour le retrouver ici.</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-violet-100 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#24152f]">Compte</h2>
              <p class="mt-1 text-sm text-zinc-500">Déconnexion de la session actuelle.</p>
            </div>
            <button
              type="button"
              on:click={logout}
              class="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Se déconnecter
            </button>
          </div>
        </section>
      </div>
    </div>
  {/if}
</div>

{#snippet TagList(values: string[], field: TagField, color: 'violet' | 'emerald')}
  {#if values.length}
    <div class="flex flex-wrap gap-2">
      {#each values as tag, index}
        <span
          class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
            color === 'emerald'
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
              : 'bg-violet-50 text-violet-700 ring-violet-100'
          }`}
        >
          {tag}
          <button type="button" on:click={() => removeTag(field, index)} class="text-current/70 transition hover:text-current" aria-label={`Retirer ${tag}`}>
            ×
          </button>
        </span>
      {/each}
    </div>
  {:else}
    <p class="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">Aucun élément ajouté.</p>
  {/if}
{/snippet}
