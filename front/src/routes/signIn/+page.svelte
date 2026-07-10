<script lang="ts">
  import { goto } from '$app/navigation';
  import { AuthAPI } from '$lib/api/auth';
  import { user } from '$lib/stores/user';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let showPassword = false;

  async function login() {
    error = '';
    loading = true;

    try {
      const data = await AuthAPI.login({ email, password });
      user.setUser(data.result);
      goto('/dashboard');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Identifiants incorrects';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Connexion - VitiLink</title>
</svelte:head>

<div class="space-y-5">
  <div>
    <div class="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
      Espace professionnel
    </div>

    <h1 class="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
      Connexion
    </h1>
    <p class="mt-2 text-sm leading-6 text-zinc-600">
      Retrouvez vos annonces, vos conversations et vos contacts professionnels.
    </p>
  </div>

  <form on:submit|preventDefault={login} class="space-y-4">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-zinc-800" for="email">
        Email professionnel
      </label>
      <div class="relative">
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          autocomplete="email"
          placeholder="vous@domaine.fr"
          class="w-full rounded-lg border border-violet-100 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <label class="block text-sm font-medium text-zinc-800" for="password">
          Mot de passe
        </label>
        <a
          href="/forgot-password"
          class="text-xs font-medium text-violet-700 hover:text-violet-800 hover:underline"
        >
          Mot de passe oublié ?
        </a>
      </div>

      <div class="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          required
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full rounded-lg border border-violet-100 bg-white px-4 py-3 pr-16 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <button
          type="button"
          on:click={() => (showPassword = !showPassword)}
          class="absolute inset-y-1 right-1 rounded-md px-2 text-xs font-medium text-zinc-500 transition hover:bg-violet-50 hover:text-violet-700"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? 'Masquer' : 'Voir'}
        </button>
      </div>
    </div>

    {#if error}
      <div class="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clip-rule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="group inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
      style="background: linear-gradient(135deg, #6d35a8 0%, #8b5cf6 100%); box-shadow: 0 14px 28px rgba(124, 58, 237, 0.22);"
    >
      {#if loading}
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
          <path class="opacity-90" d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
        </svg>
        Connexion en cours...
      {:else}
        Se connecter
      {/if}
    </button>
  </form>

  <div class="relative py-1">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-zinc-200"></div>
    </div>
    <div class="relative flex justify-center">
      <span class="bg-white px-3 text-xs text-zinc-400">Nouveau sur VitiLink ?</span>
    </div>
  </div>

  <div class="text-center">
    <p class="text-sm text-zinc-500">
      Vous n’avez pas encore de compte ?
      <a href="/signUp" class="font-semibold text-violet-700 hover:text-violet-800 hover:underline">
        Créer un compte
      </a>
    </p>
  </div>
</div>
