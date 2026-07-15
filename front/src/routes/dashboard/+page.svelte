<script lang="ts">
  import { onMount } from 'svelte';
  import { AuthAPI } from '$lib/api/auth';
  import { AnnonceAPI } from '$lib/api/annonce';
  import { ConversationAPI } from '$lib/api/conversation';
  import { PaymentAPI } from '$lib/api/payment';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import { user } from '$lib/stores/user';
  import type { Annonce, Conversation, Order, User } from '$lib/types';
  import { getProfileCompletion } from '$lib/utils/profileCompletion';

  let loading = $state(true);
  let error = $state('');
  let profile = $state<User | null>(null);
  let annonces = $state<Annonce[]>([]);
  let conversations = $state<Conversation[]>([]);
  let orders = $state<Order[]>([]);

  type ActivityTone = 'violet' | 'emerald' | 'amber' | 'rose';

  const shortcuts = [
    {
      label: 'Déposer une annonce',
      href: '/dashboard/mes-annonces/nouveau',
      detail: 'Raisin, moût ou jus',
    },
    {
      label: 'Explorer le marché',
      href: '/dashboard/marche',
      detail: 'Voir les opportunités',
    },
    {
      label: 'Ouvrir les messages',
      href: '/dashboard/conversations',
      detail: 'Répondre aux contacts',
    },
  ];

  const priorities = [
    ['Structurer une offre', 'Ajoutez volume, localisation, disponibilité et conditions pour faciliter la comparaison.'],
    ['Répondre vite', 'Les échanges récents remontent dans la messagerie pour garder une relation fluide.'],
    ['Centraliser les pièces', 'Gardez les documents utiles rattachés au bon contexte professionnel.'],
  ];

  const activeAnnonceCount = $derived(annonces.filter((annonce) => annonce.status === 'PUBLISHED').length);
  const draftAnnonceCount = $derived(annonces.filter((annonce) => annonce.status === 'DRAFT').length);
  const orderInProgressCount = $derived(orders.filter((order) => ['PENDING', 'PAID', 'SHIPPED'].includes(order.status)).length);
  const receivedMessageCount = $derived(
    conversations.reduce(
      (count, conversation) =>
        count + conversation.messages.filter((message) => message.senderId !== profile?.id).length,
      0,
    ),
  );
  const contactCount = $derived(
    new Set(
      conversations
        .map((conversation) => {
          const other = profile?.id === conversation.buyerId ? conversation.annonce.creator : conversation.buyer;
          return other?.id;
        })
        .filter(Boolean),
    ).size,
  );

  const companyCompletion = $derived(getProfileCompletion(profile));
  const companyCompletionDegrees = $derived(Math.max(0, Math.min(100, companyCompletion.percent)) * 3.6);
  const stats = $derived([
    {
      label: 'Annonces publiées',
      value: loading ? '...' : String(activeAnnonceCount),
      helper: `${annonces.length} annonce${annonces.length !== 1 ? 's' : ''} au total`,
      detail: `${draftAnnonceCount} brouillon${draftAnnonceCount !== 1 ? 's' : ''}`,
      color: 'violet',
      href: '/dashboard/mes-annonces',
    },
    {
      label: 'Messages reçus',
      value: loading ? '...' : String(receivedMessageCount),
      helper: `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`,
      detail: 'Total calculé depuis vos conversations',
      color: 'emerald',
      href: '/dashboard/conversations',
    },
    {
      label: 'Contacts',
      value: loading ? '...' : String(contactCount),
      helper: 'Interlocuteurs distincts',
      detail: 'Acheteurs ou vendeurs liés à vos échanges',
      color: 'amber',
      href: '/dashboard/conversations',
    },
    {
      label: 'Commandes',
      value: loading ? '...' : String(orders.length),
      helper: `${orderInProgressCount} en cours`,
      detail: 'Données issues du module paiement',
      color: 'rose',
      href: '/dashboard/commandes',
    },
  ]);

  const activity = $derived(getRecentActivity(annonces, conversations, orders, profile));

  onMount(loadDashboard);

  async function loadDashboard() {
    loading = true;
    error = '';

    try {
      const [meData, annonceData, conversationData, orderData] = await Promise.all([
        AuthAPI.me(),
        AnnonceAPI.listMine(),
        ConversationAPI.findAll(),
        PaymentAPI.findMyOrders(),
      ]);

      profile = meData.result;
      if (profile) user.setUser(profile);
      annonces = annonceData.result;
      orders = orderData;

      conversations = await Promise.all(
        conversationData.map((conversation) =>
          ConversationAPI.findOne(conversation.id).catch(() => conversation),
        ),
      );
    } catch (e) {
      error = e instanceof Error ? e.message : 'Impossible de charger les données du tableau de bord.';
    } finally {
      loading = false;
    }
  }

  function getRecentActivity(
    annonceItems: Annonce[],
    conversationItems: Conversation[],
    orderItems: Order[],
    currentUser: User | null,
  ) {
    const annonceEvents = annonceItems.map((annonce) => ({
      date: annonce.updatedAt ?? annonce.createdAt ?? '',
      label: annonce.status === 'PUBLISHED' ? 'Annonce publiée' : 'Annonce mise à jour',
      detail: annonce.title,
      type: 'annonce' as const,
      tone: annonce.status === 'PUBLISHED' ? ('violet' as const) : ('amber' as const),
      href: '/dashboard/mes-annonces',
    }));

    const conversationEvents = conversationItems.map((conversation) => {
      const lastMessage = conversation.messages[conversation.messages.length - 1] ?? conversation.messages[0];
      const other = currentUser?.id === conversation.buyerId ? conversation.annonce.creator : conversation.buyer;
      return {
        date: lastMessage?.createdAt ?? conversation.updatedAt,
        label: lastMessage ? `Message avec ${displayName(other)}` : `Conversation avec ${displayName(other)}`,
        detail: conversation.annonce.title,
        type: 'message' as const,
        tone: 'emerald' as const,
        href: `/dashboard/conversations/${conversation.id}`,
      };
    });

    const orderEvents = orderItems.map((order) => ({
      date: order.updatedAt ?? order.createdAt,
      label: `Commande ${formatOrderStatus(order.status)}`,
      detail: order.annonce?.title ?? `Commande ${order.id.slice(0, 8)}`,
      type: 'order' as const,
      tone: orderActivityTone(order.status),
      href: '/dashboard/commandes',
    }));

    return [...annonceEvents, ...conversationEvents, ...orderEvents]
      .filter((event) => event.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  function activityIconClass(tone: ActivityTone) {
    const classes: Record<ActivityTone, string> = {
      violet: 'bg-violet-50 text-violet-700 ring-violet-100',
      emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      amber: 'bg-amber-50 text-amber-700 ring-amber-100',
      rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    };

    return classes[tone];
  }

  function orderActivityTone(status: Order['status']): ActivityTone {
    if (status === 'PAID' || status === 'DELIVERED') return 'emerald';
    if (status === 'PENDING' || status === 'SHIPPED') return 'amber';
    return 'rose';
  }

  function displayName(person?: { username: string; firstName?: string; lastName?: string } | null) {
    if (!person) return 'un contact';
    if (person.firstName && person.lastName) return `${person.firstName} ${person.lastName}`;
    return person.username;
  }

  function formatOrderStatus(status: Order['status']) {
    const labels: Record<Order['status'], string> = {
      PENDING: 'en attente',
      PAID: 'payée',
      SHIPPED: 'expédiée',
      DELIVERED: 'livrée',
      CANCELED: 'annulée',
      FAILED: 'échouée',
    };

    return labels[status];
  }

  function relativeDate(date?: string) {
    if (!date) return '';
    const value = new Date(date);
    const diff = Date.now() - value.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return value.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
</script>

<svelte:head>
  <title>Dashboard - VitiLink</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-14">
  <section class="relative isolate overflow-hidden rounded-lg border border-violet-100 shadow-[0_28px_80px_rgba(36,21,47,0.12)]">
    <img
      src="/assets/images/header.jpg"
      alt=""
      class="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center]"
    />

    <div class="grid gap-8 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-9">
      <div class="max-w-3xl text-[#24152f]">
        <div class="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-xs font-semibold text-[#24152f] backdrop-blur">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          Données en temps réel
        </div>

        <h1 class="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Bonjour, {profile?.username ?? $user?.username ?? 'Utilisateur'}
        </h1>

        <p class="mt-4 max-w-2xl text-sm leading-7 text-[#24152f]/80 sm:text-base">
          Vos indicateurs suivent vos annonces, vos conversations, vos commandes et votre profil professionnel.
        </p>

        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard/mes-annonces/nouveau"
            class="inline-flex items-center justify-center rounded-lg bg-[#5b2df2] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,45,242,0.24)] transition hover:-translate-y-0.5 hover:bg-[#4b22ce]"
          >
            Déposer une annonce
          </a>
          <a
            href="/dashboard/marche"
            class="inline-flex items-center justify-center rounded-lg border border-violet-100 bg-white/80 px-5 py-3 text-sm font-semibold text-[#24152f] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
          >
            Explorer le marché
          </a>
        </div>
      </div>

      <div class="grid content-end gap-3 sm:grid-cols-2 lg:pl-10">
        {#each stats.slice(0, 2) as stat}
          <a
            href={stat.href}
            class="block rounded-lg border border-violet-100 bg-white/85 p-4 text-[#24152f] shadow-sm backdrop-blur transition hover:-translate-y-1 hover:bg-white"
          >
            <div class="text-3xl font-semibold tracking-tight">{stat.value}</div>
            <div class="mt-1 text-sm font-semibold">{stat.label}</div>
            <div class="mt-2 text-xs leading-5 text-zinc-600">{stat.helper}</div>
          </a>
        {/each}
      </div>
    </div>
  </section>

  {#if error}
    <div class="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
      {error}
    </div>
  {/if}

  <section class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {#each stats as stat}
      <a
        href={stat.href}
        class="group block rounded-lg border border-violet-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(48,22,75,0.10)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-zinc-500">{stat.label}</p>
            <p class="mt-2 text-3xl font-semibold tracking-tight text-[#24152f]">{stat.value}</p>
          </div>
          <div
            class={`grid h-10 w-10 place-items-center rounded-lg ${
              stat.color === 'emerald'
                ? 'bg-emerald-50 text-emerald-700'
                : stat.color === 'amber'
                  ? 'bg-amber-50 text-amber-700'
                  : stat.color === 'rose'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-violet-50 text-violet-700'
            }`}
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 19V8m7 11V5m7 14v-7" />
            </svg>
          </div>
        </div>
        <div class="mt-4 border-t border-zinc-100 pt-4">
          <span class="block text-xs leading-5 text-zinc-500">{stat.helper}</span>
          <span class="mt-3 inline-flex max-w-full rounded-full bg-[#fbfaf8] px-2.5 py-1 text-xs font-semibold leading-5 text-violet-800 ring-1 ring-violet-100">
            {stat.detail}
          </span>
        </div>
      </a>
    {/each}
  </section>

  <section class="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
    <div class="rounded-lg border border-violet-100 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-violet-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[#24152f]">Priorités terrain</h2>
          <p class="mt-1 text-sm text-zinc-500">Les actions qui font avancer les échanges B2B.</p>
        </div>
        <a href="/dashboard/conversations" class="inline-flex items-center justify-center rounded-lg border border-violet-100 px-4 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-50">
          Voir les messages
        </a>
      </div>

      <div class="grid gap-4 p-5 md:grid-cols-3">
        {#each priorities as item, index}
          <article class="rounded-lg bg-[#fbfaf8] p-5 ring-1 ring-violet-100 transition hover:-translate-y-1 hover:bg-violet-50/70">
            <div class="grid h-9 w-9 place-items-center rounded-lg bg-[#5b2df2] text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 class="mt-4 text-sm font-semibold text-[#24152f]">{item[0]}</h3>
            <p class="mt-2 text-sm leading-6 text-zinc-600">{item[1]}</p>
          </article>
        {/each}
      </div>
    </div>

    <aside class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
      <div class="relative h-40 overflow-hidden">
        <img
          src="/assets/images/image-recolte.jpeg"
          alt="Récolte viticole"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/70 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <p class="text-sm font-semibold">Vue pilote</p>
          <p class="mt-1 text-xs text-white/75">Suivre les opportunités sans perdre le contexte.</p>
        </div>
      </div>
      <div class="space-y-3 p-5">
        {#each shortcuts as item}
          <a
            href={item.href}
            class="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-[#fbfaf8] px-4 py-3 transition hover:border-violet-200 hover:bg-violet-50"
          >
            <span>
              <span class="block text-sm font-semibold text-[#24152f]">{item.label}</span>
              <span class="mt-0.5 block text-xs text-zinc-500">{item.detail}</span>
            </span>
            <svg class="h-4 w-4 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-violet-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </a>
        {/each}
      </div>
    </aside>
  </section>

  <section class="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
    <aside class="rounded-lg border border-violet-100 bg-[#24152f] p-5 text-white shadow-sm">
      <p class="text-sm font-semibold text-violet-100">Profil professionnel</p>
      <div class="mt-5 flex items-center gap-4">
        <div class="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/14 text-xl font-bold">
          {(profile?.username ?? $user?.username ?? 'U').charAt(0).toUpperCase()}
        </div>
        <div class="min-w-0">
          <div class="truncate font-semibold">{profile?.username ?? $user?.username ?? 'Utilisateur'}</div>
          <div class="mt-1 truncate text-xs text-white/62">{profile?.email ?? $user?.email ?? 'Compte testeur'}</div>
        </div>
      </div>

      <div class="mt-5 rounded-lg border border-white/10 bg-white/10 p-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
          <div
            class="relative grid h-28 w-28 shrink-0 place-items-center rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
            style={`background: conic-gradient(from -90deg, #c4b5fd 0deg, #7c3aed ${companyCompletionDegrees}deg, rgba(255,255,255,0.18) ${companyCompletionDegrees}deg, rgba(255,255,255,0.18) 360deg);`}
            aria-label={`Profil professionnel complété à ${companyCompletion.percent}%`}
          >
            <div class="absolute inset-3 rounded-full bg-[#24152f]"></div>
            <div class="relative text-center">
              <div class="text-2xl font-semibold">{companyCompletion.percent}%</div>
              <div class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">complété</div>
            </div>
          </div>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-white">Dossier professionnel</p>
            <p class="mt-2 text-sm leading-6 text-white/70">
              {#if companyCompletion.hasCompany}
                {companyCompletion.completed}/{companyCompletion.total} informations utiles sont renseignées pour inspirer confiance aux interlocuteurs.
              {:else}
                Commencez par rattacher votre entreprise pour présenter un dossier complet aux interlocuteurs.
              {/if}
            </p>
          </div>
        </div>
      </div>
      <a
        href="/dashboard/profil"
        class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#24152f] transition hover:bg-violet-50"
      >
        {companyCompletion.percent < 100 ? 'Compléter mes informations' : 'Voir mon profil'}
      </a>
    </aside>

    <div class="rounded-lg border border-violet-100 bg-white shadow-sm">
      <div class="border-b border-violet-100 px-5 py-5">
        <h2 class="text-lg font-semibold text-[#24152f]">Activité récente</h2>
      </div>
      {#if loading}
        <div class="p-5">
          <LoadingState
            compact
            title="Mise à jour de l’activité"
            text="Nous récupérons vos derniers messages, annonces et commandes."
          />
        </div>
      {:else if activity.length}
        <div class="divide-y divide-zinc-100">
          {#each activity as item}
            <a href={item.href} class="group flex items-start gap-4 px-5 py-4 transition hover:bg-[#fbfaf8]">
              <div class={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-lg ring-1 ${activityIconClass(item.tone)}`}>
                {#if item.type === 'message'}
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H12l-4.5 4v-4A3.5 3.5 0 0 1 4 11.5v-5Z" />
                  </svg>
                {:else if item.type === 'order'}
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10v13H7V7Zm2-3h6l1 3H8l1-3Zm1 8h4m-4 4h6" />
                  </svg>
                {:else}
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 10h16l-1.3-4.5A2 2 0 0 0 16.78 4H7.22A2 2 0 0 0 5.3 5.5L4 10Zm1 0v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8M9 14h6" />
                  </svg>
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">{relativeDate(item.date)}</div>
                <p class="mt-1 text-sm font-semibold text-zinc-800">{item.label}</p>
                <p class="mt-1 truncate text-sm text-zinc-500">{item.detail}</p>
              </div>
              <svg class="mt-0.5 h-4 w-4 shrink-0 self-center text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-violet-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </a>
          {/each}
        </div>
      {:else}
        <div class="px-5 py-10 text-center">
          <p class="text-sm font-semibold text-[#24152f]">Aucune activité pour le moment</p>
          <p class="mt-2 text-sm text-zinc-500">Publiez une annonce ou démarrez une conversation pour alimenter cette zone.</p>
        </div>
      {/if}
    </div>
  </section>
</div>
