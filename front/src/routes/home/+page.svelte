<script lang="ts">
  import { user } from '../../stores/user';
  import { AuthAPI } from '../../api/auth';

  async function handleLogout() {
    try {
      await AuthAPI.logout();
      user.clear();
      window.location.href = '/signIn';
    } catch (err) {
      console.error('Erreur logout', err);
    }
  }
</script>

{#if $user}
  <h1>Welcome {$user.username}</h1>
  <button on:click={handleLogout}>Logout</button>
{:else}
  <p>Loading...</p>
{/if}
