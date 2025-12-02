<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '../../stores/user';
  import { AuthAPI } from '../../api/auth';

  onMount(async () => {
    if ($user) return;

    try {
      const data = await AuthAPI.me();
      if (data.result) {
        user.setUser(data.result);
      } else {
        window.location.href = '/signIn';
      }
    } catch (err) {
      user.clear();
      window.location.href = '/signIn';
    }
  });
</script>

<slot />
