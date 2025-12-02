<script lang="ts">
  import { goto } from '$app/navigation';
  import { AuthAPI } from '../../api/auth';

  let email = '';
  let password = '';
  let passwordConfirm = '';
  let username = '';
  let error = '';
  let success = '';

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    error = '';
    success = '';

    try {
      const res = await AuthAPI.signup({ username, email, password, passwordConfirm });
      success = "Compte créé avec succès 🎉 Redirection...";
      setTimeout(() => goto('/signIn'), 1500);

    } catch (err: any) {
      error = err?.message ?? "Une erreur est survenue";
    }
  };
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <form class="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4" on:submit={handleSubmit}>
    <h1 class="text-2xl font-bold text-center text-gray-800">Créer un compte</h1>

    <div>
      <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
      <input
        id="username"
        type="text"
        bind:value={username}
        required
        class="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        class="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        class="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
      <input
        id="confirmPassword"
        type="password"
        bind:value={passwordConfirm}
        required
        class="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
      S'inscrire
    </button>

    {#if error}
      <p class="text-red-500 text-sm text-center mt-2">{error}</p>
    {/if}

    {#if success}
      <p class="text-green-600 text-sm text-center mt-2">{success}</p>
    {/if}
  </form>
</div>
