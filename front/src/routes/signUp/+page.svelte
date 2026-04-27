<script lang="ts">
  import { goto } from '$app/navigation';
  import { AuthAPI } from '$lib/api/auth';
  import { user } from '$lib/stores/user';

  let username = '';
  let email = '';
  let password = '';
  let passwordConfirm = '';
  let loading = false;
  let error = '';
  let success = '';

  async function handleSubmit() {
    error = '';
    success = '';

    if (password !== passwordConfirm) {
      error = 'Les mots de passe ne correspondent pas';
      return;
    }

    loading = true;
    try {
      await AuthAPI.signup({ username, email, password, passwordConfirm });
      const data = await AuthAPI.login({ email, password });
      user.setUser(data.result);
      goto('/onboarding');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Une erreur est survenue';
      loading = false;
    }
  }
</script>

<div class="space-y-8">

  <div>
    <div class="mb-4 h-1 w-8 rounded-full bg-gradient-to-r from-violet-400 via-brand-600 to-violet-400"></div>
    <h1 class="text-3xl font-semibold text-zinc-900 tracking-tight">Créer un compte</h1>
    <p class="mt-1.5 text-sm text-zinc-500">Rejoignez la communauté viticole</p>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-5">

    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-zinc-700" for="username">Nom d'utilisateur</label>
      <input
        id="username"
        type="text"
        bind:value={username}
        required
        placeholder="Jean Dupont"
        class="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
               focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition"
      />
    </div>

    <div class="space-y-1.5">
      <label class="block text-sm font-medium text-zinc-700" for="email">Email professionnel</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        placeholder="vous@domaine.fr"
        class="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
               focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-zinc-700" for="password">Mot de passe</label>
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
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-zinc-700" for="confirm">Confirmation</label>
        <input
          id="confirm"
          type="password"
          bind:value={passwordConfirm}
          required
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400
                 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition"
        />
      </div>
    </div>

    {#if error}
      <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
        </svg>
        {error}
      </div>
    {/if}

    {#if success}
      <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        {success}
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="w-full py-3 px-6 rounded-2xl bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-700/20
             hover:bg-brand-800 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      {loading ? 'Création du compte…' : 'Créer mon compte'}
    </button>
  </form>

  <p class="text-sm text-center text-zinc-500">
    Déjà un compte ?
    <a href="/signIn" class="text-brand-700 font-medium hover:underline">Se connecter</a>
  </p>
</div>
