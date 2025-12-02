<script lang="ts">
  import { AuthAPI } from '../../api/auth';
  import { user } from '../../stores/user';

  let email = '';
  let password = '';
  let error = '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    error = '';

    try {
      const data = await AuthAPI.login({ email, password });
      user.setUser(data.result);
      window.location.href = '/home';
    } catch (err) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = String(err);
      }
    }
  };
</script>


<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <form class="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4" on:submit={handleSubmit}>
    <h1 class="text-2xl font-bold text-center text-gray-800">Se connecter</h1>

    <input type="email" placeholder="Email" bind:value={email} required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />

    <input type="password" placeholder="Mot de passe" bind:value={password} required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />

    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
      Connexion
    </button>

    {#if error}
      <p class="text-red-500 text-center">{error}</p>
    {/if}
  </form>
</div>
