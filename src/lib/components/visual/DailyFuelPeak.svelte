<script>
  import firePhoto from '$lib/assets/firePhotos/fire_6.webp';
  import { showDailyFirePhoto } from '$lib/shared/dailyBehaviour.js';
  let { ros = null, flame = null } = $props();
  const showPhoto = $derived(showDailyFirePhoto(ros, flame));
</script>

{#if showPhoto}
  <span class="day-fuel-background" aria-hidden="true">
    <img src={firePhoto} alt="" loading="lazy" decoding="async" />
  </span>
{/if}

<style>
  .day-fuel-background { position: absolute; inset: 35% 0 0; z-index: 0; pointer-events: none; opacity: 0.35; mask-image: linear-gradient(to bottom, transparent, rgb(0 0 0 / 15%) 35%, black); }
  .day-fuel-background img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
</style>
