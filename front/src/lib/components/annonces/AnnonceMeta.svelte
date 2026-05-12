<script lang="ts">
  export let label = '';
  export let value = '';
</script>

<div>
  <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</div>
  <div class="mt-1 text-sm font-semibold text-zinc-900">{value || '—'}</div>
</div>
