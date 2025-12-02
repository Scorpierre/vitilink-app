<script>
  import { goto } from '$app/navigation';

  const goToLogin = () => goto('/signIn');
  const goToSignup = () => goto('/signUp');
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="text-center space-y-6">
    <h1 class="text-3xl font-bold text-gray-800">Bienvenue sur VitiLink 🍇</h1>
    <p class="text-gray-600">Connectez-vous ou créez un compte pour continuer</p>

    <div class="flex justify-center gap-4">
      <button
        on:click={goToLogin}
        class="px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
      >
        Login
      </button>
      <button
        on:click={goToSignup}
        class="px-6 py-3 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold shadow-md"
      >
        Sign Up
      </button>
    </div>
  </div>
</div>
