<script lang="ts">
  export let label = '';
  export let helper = '';
  export let required = false;
</script>

<label class="block space-y-2">
  <span class="block text-sm font-medium text-zinc-800">
    {label}{#if required}<span class="text-rose-500"> *</span>{/if}
  </span>
  <slot />
  {#if helper}
    <span class="block text-xs leading-5 text-zinc-500">{helper}</span>
  {/if}
</label>
