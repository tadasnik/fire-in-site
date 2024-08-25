import { writable, derived } from 'svelte/store'
import { timeFormat } from 'd3-time-format'

export function differenceHours(date1, date2) {
  return (date1 - date2) / 3600000
};

export function getRoundedDate() {
  return new Date(3600000 * (Math.round(Date.now() / 3600000)))
};

export function getMonth(date) {
  return date.getMonth() + 1
}

export function getHour(date) {
  return date.getHours() + 1
}
export const currentDateTime = writable(
  new Date()
)

export const dateString = derived(currentDateTime, ($currentDateTime) => {
  return timeFormat('%Y-%m-%d')($currentDateTime)
})

export const timeMode = writable('current')

export const dateTime = derived(
  currentDateTime, ($currentDateTime) => {
    return 3600000 * (Math.round($currentDateTime / 3600000))
  }
)

export const month = derived(
  [currentDateTime],
  ([$currentDateTime]) => {
    return $currentDateTime.getMonth() + 1;
  })

export const hour = derived(
  [currentDateTime],
  ([$currentDateTime]) => {
    return $currentDateTime.getHours() + 1;

  })

export const historicalYear = writable()
export const historicalMonth = writable()
export const historicalDay = writable()
export const historicalDate = derived([historicalYear, historicalMonth, historicalDay], ([$historicalYear, $historicalMonth, $historicalDay]) => {
  console.log("historicalDate", $historicalYear, $historicalMonth, $historicalDay)
  return new Date($historicalYear, $historicalMonth, $historicalDay, 12, 0)
})

