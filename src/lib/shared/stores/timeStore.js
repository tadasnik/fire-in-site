import { writable, derived } from 'svelte/store'
import { timeFormat } from 'd3-time-format'

export function getDateString(date) {
  return timeFormat('%Y-%m-%d')(date)
}
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

export const timeMode = writable('user')

export const dateTime = derived(
  currentDateTime, ($currentDateTime) => {
    return 3600000 * (Math.round($currentDateTime / 3600000))
  }
)

export const focusDay = derived([currentDateTime], ([$currentDateTime]) => {
  console.log("focusDay calc, currentDateTime,", $currentDateTime)
  const focusDate = new Date(
    $currentDateTime.getFullYear(),
    $currentDateTime.getMonth(),
    $currentDateTime.getDate(),
  ).setHours(0, 0, 0)
  console.log("focusDate calc, focusDate,", new Date(focusDate))

  return focusDate
  // return 3600000 * (Math.round(focusDate / 3600000))
})

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
  console.log("historicalDate", new Date($historicalYear, $historicalMonth, $historicalDay, 12, 0))
  if (isNaN($historicalYear) || isNaN($historicalMonth) || isNaN($historicalDay)) {
    return false
  } else {
    console.log("first else")
    const histDate = new Date($historicalYear, $historicalMonth, $historicalDay, 12, 0)
    if (histDate < new Date(1970, 1, 1, 12, 0)) {
      return false
    } else if (histDate > new Date()) {
      console.log("second else, future date", histDate, new Date())
      return false
    } else {
      return histDate
    }
  }
})
