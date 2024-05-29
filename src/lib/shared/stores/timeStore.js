import { writable, derived } from 'svelte/store'

export function differenceHours(date1, date2) {
  return (date1 - date2) / 3600000
};

export function getRoundedDate() {
  return new Date(3600000 * (Math.round(Date.now() / 3600000)))
};

export const dateTime = writable(getRoundedDate())

export const month = derived(
  [dateTime],
  ([$dateTime]) => {
    console.log('$dateTime ', $dateTime)
    return $dateTime.getMonth() + 1;
  })

export const hour = derived(
  [dateTime],
  ([$dateTime]) => {
    return $dateTime.getHours() + 1;

  })
