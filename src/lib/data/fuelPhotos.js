import fuels from './UKFuelModels.json';
import { fuelRootCode } from '$lib/shared/utils.js';

const photos = import.meta.glob('$lib/assets/bars_background/*.webp', {
  eager: true, query: '?url', import: 'default',
});

const firePhotos = import.meta.glob('$lib/assets/fuelModelPhotos/*fire*.webp', {
  eager: true, query: '?url', import: 'default',
});
import heathFire from '$lib/assets/firePhotos/fire_6.webp';

const categories = {
  g: { label: 'Gorse', fire: 'gm_fire' },
  gr: { label: 'Grass' },
  cl: { label: 'Heather', src: heathFire },
  mh: { label: 'Mixed heath', fire: 'mhh_fire2_s' },
  bc: { label: 'Heather brash' },
  bk: { label: 'Bracken' },
  bv: { label: 'Bilberry' },
  wb: { label: 'Cereal crop' },
  bl: { label: 'Leaf litter' },
  sn: { label: 'Needle litter', fire: 'ln_fire' },
  ln: { label: 'Needle litter', fire: 'ln_fire' },
};

export function fuelCategory(fuel) {
  if (!fuel || !fuels[fuel]) return null;
  const root = fuelRootCode(fuel);
  const category = categories[root];
  if (!category) return null;
  const fire = category.src ?? firePhotos[`/src/lib/assets/fuelModelPhotos/${category.fire}.webp`];
  return { label: category.label, src: fire ?? photos[`/src/lib/assets/bars_background/${root}.webp`] ?? null, flaming: !!fire };
}

export function fuelPhoto(fuel) {
  if (!fuel) return null;
  const model = fuels[fuel];
  return {
    code: model?.code ?? fuel.toUpperCase(),
    label: model?.label ?? fuel,
    // Match Bars.svelte exactly: fuel variants share the group's background.
    src: model ? photos[`/src/lib/assets/bars_background/${fuelRootCode(fuel)}.webp`] ?? null : null,
  };
}
