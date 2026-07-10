<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { StripeElements } from '@stripe/stripe-js';
  import { AnnonceAPI } from '$lib/api/annonce';
  import { PaymentAPI } from '$lib/api/payment';
  import { getStripe } from '$lib/stripe';
  import type { Annonce } from '$lib/types';
  import Alert from '$lib/components/utils/Alert.svelte';
  import LoadingState from '$lib/components/utils/LoadingState.svelte';
  import { formatPrice, formatVolume, getPurchaseStatus, imageUrl } from '$lib/utils/annonce';

  const fullLotQuantity = 1;
  const paidOrderStatuses = ['PAID', 'SHIPPED', 'DELIVERED'];

  let annonce: Annonce | null = null;
  let loading = true;
  let error = '';

  let step: 'summary' | 'payment' | 'validating' | 'success' = 'summary';
  let resuming = false;

  let creating = false;
  let paying = false;
  let payError = '';

  let elements: StripeElements | null = null;
  let paymentElementContainer: HTMLDivElement;
  let orderId = '';

  $: unitPrice = annonce?.price ?? 0;
  $: total = unitPrice;
  $: location = annonce?.location || [annonce?.city, annonce?.region].filter(Boolean).join(', ');
  $: heroImage = annonce?.images?.[0] ? imageUrl(annonce.images[0]) : '/assets/images/header.jpg';
  $: lotSummary = annonce
    ? [
        formatVolume(annonce),
        location || 'Localisation à préciser',
        annonce.availabilityTiming || 'Disponibilité à convenir',
      ]
    : [];

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      const res = await AnnonceAPI.getOne($page.params.annonceId);
      annonce = res.result;
      const paidOrder = annonce.orders?.find((order) => isPaidStatus(order.status));
      const pendingOrder = annonce.orders?.find((order) => order.status === 'PENDING');

      if (paidOrder) {
        orderId = paidOrder.id;
        step = 'success';
        return;
      }

      if (pendingOrder) {
        orderId = pendingOrder.id;
        const syncedOrder = await PaymentAPI.syncOrder(pendingOrder.id).catch(() => null);
        if (syncedOrder && isPaidStatus(syncedOrder.status)) {
          step = 'success';
          resuming = false;
          return;
        }
      }

      if (annonce.price == null || annonce.price <= 0) {
        error = "Cette annonce n'a pas de prix défini, l'achat est impossible.";
      } else if (getPurchaseStatus(annonce) === 'PAID') {
        error = 'Cette annonce a déjà été payée.';
      }

      resuming = Boolean(pendingOrder);
      if (!resuming && getPurchaseStatus(annonce) === 'IN_PROGRESS') {
        error = "Cette annonce est déjà en cours d'achat.";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Erreur lors du chargement de l'annonce.";
    } finally {
      loading = false;
    }
  }

  async function startPayment() {
    if (!annonce) return;
    creating = true;
    payError = '';
    try {
      const { clientSecret, orderId: id, status, alreadyPaid } = await PaymentAPI.createOrder(annonce.id, fullLotQuantity);
      orderId = id;

      if (alreadyPaid || isPaidStatus(status)) {
        step = 'success';
        return;
      }

      if (!clientSecret) {
        throw new Error('La commande est en cours de synchronisation. Rechargez la page dans quelques instants.');
      }

      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe ne s’est pas chargé (clé publique manquante ?).');

      elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      step = 'payment';

      await Promise.resolve();
      const paymentElement = elements.create('payment');
      paymentElement.mount(paymentElementContainer);
    } catch (e) {
      payError = e instanceof Error ? e.message : 'Impossible de démarrer le paiement.';
    } finally {
      creating = false;
    }
  }

  async function confirmPayment() {
    if (!elements) return;
    paying = true;
    payError = '';
    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe indisponible.');

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        payError = stripeError.message ?? 'Le paiement a échoué.';
        return;
      }

      step = 'validating';
      await waitForPaidOrder(orderId);
      step = 'success';
    } catch (e) {
      payError = e instanceof Error ? e.message : 'Le paiement a échoué.';
      step = 'payment';
    } finally {
      paying = false;
    }
  }

  async function waitForPaidOrder(id: string) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const order = await PaymentAPI.syncOrder(id);
      if (isPaidStatus(order.status)) return order;
      await delay(attempt < 2 ? 450 : 900);
    }

    throw new Error('Paiement confirmé. La banque finalise encore la validation, la commande va se mettre à jour dans quelques instants.');
  }

  function isPaidStatus(status?: string) {
    return Boolean(status && paidOrderStatuses.includes(status));
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
</script>

<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
  {#if loading}
    <LoadingState
      title="Préparation du paiement"
      text="Nous vérifions le lot complet et les informations de commande."
    />
  {:else if error}
    <Alert type="error" message={error} />
    <a href={`/dashboard/annonces/${$page.params.annonceId}`} class="btn-secondary mt-4 inline-block">Retour à l'annonce</a>
  {:else if annonce}
    <div class="mb-8 flex items-center gap-2 text-sm text-zinc-400">
      <a href="/dashboard/marche" class="hover:text-zinc-600">Annonces</a>
      <span>/</span>
      <a href={`/dashboard/annonces/${annonce.id}`} class="hover:text-zinc-600">{annonce.title}</a>
      <span>/</span>
      <span class="font-medium text-zinc-600">Paiement</span>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section class="overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm">
        <div class="relative h-64 overflow-hidden bg-[#24152f] sm:h-80">
          <img src={heroImage} alt="" class="h-full w-full object-cover opacity-90" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#24152f]/80 via-[#24152f]/20 to-transparent"></div>
          <div class="absolute bottom-5 left-5 right-5 text-white">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/75">Lot complet</p>
            <h1 class="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{annonce.title}</h1>
            <p class="mt-2 text-sm text-white/70">{lotSummary.join(' · ')}</p>
          </div>
        </div>

        <div class="p-5 sm:p-6">
          <div class="rounded-lg border border-violet-100 bg-violet-50/60 p-4">
            <h2 class="text-base font-semibold text-[#24152f]">Paiement du lot entier</h2>
            <p class="mt-2 text-sm leading-6 text-zinc-600">
              L'achat direct concerne toute l'annonce. Il n'y a pas de sélection de quantité :
              vous prenez le lot complet, ou vous ne lancez pas de commande.
            </p>
          </div>

          {#if resuming && step === 'summary'}
            <div class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200/60">
              Vous avez une commande en attente de paiement pour cette annonce. Elle sera reprise avec le montant du lot complet.
            </div>
          {/if}

          {#if step === 'summary'}
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Volume</div>
                <div class="mt-1 text-sm font-semibold text-[#24152f]">{formatVolume(annonce)}</div>
              </div>
              <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Accès</div>
                <div class="mt-1 text-sm font-semibold text-[#24152f]">Lot complet</div>
              </div>
              <div class="rounded-lg bg-[#fbfaf8] p-4 ring-1 ring-violet-100">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Paiement</div>
                <div class="mt-1 text-sm font-semibold text-[#24152f]">Stripe sécurisé</div>
              </div>
            </div>
          {:else if step === 'payment'}
            <div class="mt-5 space-y-4">
              <div class="flex items-center justify-between rounded-lg bg-[rgb(var(--primary-50))] px-4 py-3">
                <span class="text-sm font-medium text-zinc-600">Lot complet</span>
                <span class="font-semibold text-zinc-950">{formatPrice(total)}</span>
              </div>

              <div bind:this={paymentElementContainer}></div>

              <p class="text-xs text-zinc-400">
                Mode test Stripe - utilisez la carte 4242 4242 4242 4242, une date future et n'importe quel CVC.
              </p>

              {#if payError}<p class="text-sm text-red-600">{payError}</p>{/if}

              <button
                type="button"
                on:click={confirmPayment}
                disabled={paying}
                class="btn-primary w-full disabled:opacity-50"
              >
                {paying ? 'Paiement en cours...' : `Payer ${formatPrice(total)}`}
              </button>
            </div>
          {:else if step === 'validating'}
            <div class="mt-6">
              <LoadingState
                compact
                title="Validation bancaire en cours"
                text="Le paiement est confirmé. Nous synchronisons la commande pour l'afficher comme payée."
              />
            </div>
          {:else if step === 'success'}
            <div class="mt-6 space-y-4 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">✓</div>
              <h2 class="text-lg font-semibold text-zinc-950">Commande payée</h2>
              <p class="text-sm text-zinc-500">Votre paiement est validé et le lot complet est bien enregistré comme payé.</p>
              <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button type="button" on:click={() => goto('/dashboard/commandes?vue=payees')} class="btn-primary">Voir mes commandes payées</button>
                <a href="/dashboard/marche" class="btn-secondary">Retour aux annonces</a>
              </div>
            </div>
          {/if}
        </div>
      </section>

      <aside class="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Récapitulatif</p>
          <div class="mt-4 text-3xl font-semibold text-[#24152f]">{formatPrice(total)}</div>
          <p class="mt-2 text-sm leading-6 text-zinc-500">Prix du lot complet, sans sélection de quantité.</p>

          <div class="mt-5 space-y-3 border-t border-violet-100 pt-5">
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-zinc-500">Lot</span>
              <span class="font-semibold text-zinc-900">Complet</span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-zinc-500">Volume</span>
              <span class="text-right font-semibold text-zinc-900">{formatVolume(annonce)}</span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-zinc-500">Total</span>
              <span class="font-semibold text-zinc-900">{formatPrice(total)}</span>
            </div>
          </div>

          {#if step === 'summary'}
            {#if payError}<p class="mt-4 text-sm text-red-600">{payError}</p>{/if}

            <div class="mt-5 grid gap-3">
              <button
                type="button"
                on:click={startPayment}
                disabled={creating}
                class="btn-primary w-full disabled:opacity-50"
              >
                {creating ? 'Préparation...' : 'Payer le lot complet'}
              </button>
            </div>
          {/if}
        </section>
      </aside>
    </div>
  {/if}
</div>
