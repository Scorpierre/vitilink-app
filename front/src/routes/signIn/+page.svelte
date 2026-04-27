<script lang="ts">
  import { goto } from '$app/navigation';
  import { AuthAPI } from '$lib/api/auth';
  import { user } from '$lib/stores/user';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function login() {
    error = '';
    loading = true;
    try {
      const data = await AuthAPI.login({ email, password });
      user.setUser(data.result);
      goto('/home');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Identifiants incorrects';
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-8">

  <div>
    <div class="mb-4 h-1 w-8 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></div>
    <h1 class="text-3xl font-semibold text-zinc-900 tracking-tight">Connexion</h1>
    <p class="mt-1.5 text-sm text-zinc-500">Bon retour sur VitiLink</p>
  </div>

  <form on:submit|preventDefault={login} class="space-y-5">

    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-zinc-700" for="email">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        placeholder="vous@exemple.fr"
        class="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
               focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition"
      />
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-zinc-700" for="password">Mot de passe</label>
        <a href="/forgot-password" class="text-xs text-brand-700 hover:underline">Mot de passe oublié ?</a>
      </div>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        placeholder="••••••••"
        class="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
               focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition"
      />
    </div>

    {#if error}
      <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
        </svg>
        {error}
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="w-full py-3 px-6 rounded-2xl bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-700/20
             hover:bg-brand-800 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      {loading ? 'Connexion…' : 'Se connecter'}
    </button>
  </form>

  <p class="text-sm text-center text-zinc-500">
    Pas encore de compte ?
    <a href="/signUp" class="text-brand-700 font-medium hover:underline">Créer un compte</a>
  </p>
</div>
