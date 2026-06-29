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
  import { formatPrice } from '$lib/utils/annonce';

  let annonce: Annonce | null = null;
  let loading = true;
  let error = '';

  let quantity = 1;
  let step: 'quantity' | 'payment' | 'success' = 'quantity';
  let resuming = false;

  let creating = false;
  let paying = false;
  let payError = '';

  let elements: StripeElements | null = null;
  let paymentElementContainer: HTMLDivElement;
  let orderId = '';

  $: unitPrice = annonce?.price ?? 0;
  $: total = unitPrice * quantity;

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      const res = await AnnonceAPI.getOne($page.params.annonceId);
      annonce = res.result;
      if (annonce.price == null || annonce.price <= 0) {
        error = "Cette annonce n'a pas de prix défini, l'achat est impossible.";
      } else if (annonce.soldOut || annonce.status === 'SOLD') {
        error = 'Cette annonce a déjà été vendue.';
      }

      // Reprise d'une commande en attente : préremplir la quantité
      const pending = annonce.orders?.find((o) => o.status === 'PENDING');
      if (pending) {
        quantity = pending.quantity;
        resuming = true;
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
      const { clientSecret, orderId: id } = await PaymentAPI.createOrder(annonce.id, quantity);
      orderId = id;

      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe ne s’est pas chargé (clé publique manquante ?).');

      elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      step = 'payment';

      // Wait for the DOM to render the container before mounting.
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

      step = 'success';
    } catch (e) {
      payError = e instanceof Error ? e.message : 'Le paiement a échoué.';
    } finally {
      paying = false;
    }
  }
</script>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
  {#if loading}
    <div class="flex items-center justify-center py-24 text-sm text-zinc-400">Chargement...</div>
  {:else if error}
    <Alert type="error" message={error} />
    <a href={`/home/annonces/${$page.params.annonceId}`} class="btn-secondary mt-4 inline-block">Retour à l'annonce</a>
  {:else if annonce}
    <div class="mb-8 flex items-center gap-2 text-sm text-zinc-400">
      <a href="/home/marche" class="hover:text-zinc-600">Annonces</a>
      <span>/</span>
      <a href={`/home/annonces/${annonce.id}`} class="hover:text-zinc-600">{annonce.title}</a>
      <span>/</span>
      <span class="font-medium text-zinc-600">Paiement</span>
    </div>

    <div class="card p-6">
      <h1 class="text-xl font-semibold text-zinc-950">
        {resuming ? 'Reprendre le paiement' : 'Acheter'} — {annonce.title}
      </h1>
      <p class="mt-1 text-sm text-zinc-500">Prix unitaire : {formatPrice(unitPrice)}</p>

      {#if resuming && step === 'quantity'}
        <div class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200/60">
          Vous avez une commande en attente de paiement pour cette annonce. Vous pouvez la finaliser ci-dessous.
        </div>
      {/if}

      {#if step === 'quantity'}
        <div class="mt-6 space-y-4">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-zinc-800">Quantité</span>
            <input
              type="number"
              min="1"
              step="1"
              bind:value={quantity}
              class="w-full rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm"
            />
          </label>

          <div class="flex items-center justify-between border-t border-[rgb(var(--border))] pt-4">
            <span class="text-sm text-zinc-500">Total</span>
            <span class="text-lg font-semibold text-zinc-950">{formatPrice(total)}</span>
          </div>

          {#if payError}<p class="text-sm text-red-600">{payError}</p>{/if}

          <button
            type="button"
            on:click={startPayment}
            disabled={creating || quantity < 1}
            class="btn-primary w-full disabled:opacity-50"
          >
            {creating ? 'Préparation...' : 'Continuer vers le paiement'}
          </button>
        </div>
      {:else if step === 'payment'}
        <div class="mt-6 space-y-4">
          <div class="flex items-center justify-between rounded-xl bg-[rgb(var(--primary-50))] px-4 py-3">
            <span class="text-sm text-zinc-600">{quantity} × {formatPrice(unitPrice)}</span>
            <span class="font-semibold text-zinc-950">{formatPrice(total)}</span>
          </div>

          <div bind:this={paymentElementContainer}></div>

          <p class="text-xs text-zinc-400">
            Mode test Stripe — utilisez la carte 4242 4242 4242 4242, une date future et n'importe quel CVC.
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
      {:else if step === 'success'}
        <div class="mt-6 space-y-4 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">✓</div>
          <h2 class="text-lg font-semibold text-zinc-950">Paiement confirmé</h2>
          <p class="text-sm text-zinc-500">Votre commande a bien été enregistrée.</p>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" on:click={() => goto('/home/commandes')} class="btn-primary">Voir mes commandes</button>
            <a href="/home/marche" class="btn-secondary">Retour aux annonces</a>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
